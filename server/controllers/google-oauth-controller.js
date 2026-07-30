const jwt = require("jsonwebtoken");
const { User, GoogleConnection } = require("../models/user-model");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "career@labdox.com";

const fetchWithRetry = async (url, options = {}, retries = 5, timeoutMs = 15000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[Google OAuth Fetch] Attempt ${attempt} failed: ${err.message}. Retrying...`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
};


const googleUserAuth = async (req, res) => {
  try {
    const scopes = ["openid", "email", "profile"];
    const scopeString = encodeURIComponent(scopes.join(" "));
    const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI);

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&include_granted_scopes=true&state=user_login&access_type=offline&prompt=consent&scope=${scopeString}`;

    res.redirect(url);
  } catch (error) {
    console.error("Google User Auth Error:", error);
    res.status(500).json({ msg: "Failed to initiate Google authentication" });
  }
};


const googleUserCallback = async (req, res) => {
  const code = req.query.code;
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${frontendURL}/auth-error?error=no_code`);
  }

  try {
    const tokenResponse = await fetchWithRetry("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      console.error("Token error:", tokenData);
      return res.redirect(`${frontendURL}/auth-error?error=token_failed`);
    }

    const userResponse = await fetchWithRetry(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      }
    );
    const userData = await userResponse.json();

    if (!userData || !userData.email) {
      return res.redirect(`${frontendURL}/auth-error?error=no_email`);
    }

    if (userData.email.toLowerCase() === ADMIN_EMAIL) {
      return res.redirect(
        `${frontendURL}/auth-error?error=use_admin_login`
      );
    }

    const absoluteExpiryTime = Date.now() + tokenData.expires_in * 1000;

    let userInDB = await User.findOne({ email: userData.email });

    if (!userInDB) {
      const googleData = encodeURIComponent(
        JSON.stringify({
          email: userData.email,
          fullName: userData.name,
          googleVerified: userData.email_verified || false,
          google_id: userData.sub,
        })
      );
      return res.redirect(
        `${frontendURL}/complete-registration?googleData=${googleData}`
      );
    }

    if (userData.email_verified && !userInDB.isEmailVerified) {
      userInDB.isEmailVerified = true;
      await userInDB.save();
    }

    let googleConn = await GoogleConnection.findOne({
      userId: userInDB._id,
    });

    if (googleConn) {
      googleConn.access_token = tokenData.access_token;
      googleConn.refresh_token = tokenData.refresh_token || googleConn.refresh_token;
      googleConn.access_token_expires_in = absoluteExpiryTime;
      googleConn.id_token = tokenData.id_token || googleConn.id_token;
      googleConn.scope = tokenData.scope || googleConn.scope;
      await googleConn.save();
    } else {
      await GoogleConnection.create({
        userId: userInDB._id,
        google_id: userData.sub,
        email: userInDB.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        access_token_expires_in: absoluteExpiryTime,
        scope: tokenData.scope,
        id_token: tokenData.id_token,
      });
    }

    const appToken = userInDB.generateToken();
    res.redirect(`${frontendURL}/auth-success?token=${appToken}`);
  } catch (error) {
    console.error("Google User Callback Error:", error);
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/auth-error?error=server_error`);
  }
};


const completeGoogleRegistration = async (req, res) => {
  try {
    const { email, fullName, phone, interestReason, useCase, google_id } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "Email already registered" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({ msg: "Phone number already registered" });
    }

    const userCreated = await User.create({
      fullName,
      email,
      phone,
      interestReason,
      useCase,
      authProvider: "google",
      role: "user",
      isEmailVerified: true,
      isPhoneVerified: false,
      approvalStatus: "pending",
    });

    const token = userCreated.generateToken();

    res.status(201).json({
      msg: "Registration complete",
      token,
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ msg: `${field} already exists` });
    }
    console.error("Complete Google Registration Error:", error);
    res.status(500).json({ msg: "Failed to complete registration" });
  }
};


const googleAdminAuth = async (req, res) => {
  try {
    const scopes = ["openid", "email", "profile"];
    const scopeString = encodeURIComponent(scopes.join(" "));
    const adminRedirectUri = encodeURIComponent(process.env.GOOGLE_ADMIN_REDIRECT_URI);

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${adminRedirectUri}&response_type=code&include_granted_scopes=true&state=admin_login&access_type=offline&prompt=consent&scope=${scopeString}`;

    res.redirect(url);
  } catch (error) {
    console.error("Google Admin Auth Error:", error);
    res.status(500).json({ msg: "Failed to initiate admin authentication" });
  }
};


const googleAdminCallback = async (req, res) => {
  const code = req.query.code;
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${frontendURL}/admin/auth-error?error=no_code`);
  }

  try {
    const tokenResponse = await fetchWithRetry("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.GOOGLE_ADMIN_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      console.error("Admin token error:", tokenData);
      return res.redirect(
        `${frontendURL}/admin/auth-error?error=token_failed`
      );
    }

    const userResponse = await fetchWithRetry(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      }
    );
    const userData = await userResponse.json();

    if (!userData || !userData.email) {
      return res.redirect(
        `${frontendURL}/admin/auth-error?error=no_email`
      );
    }

    if (userData.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.redirect(
        `${frontendURL}/admin/auth-error?error=access_denied`
      );
    }

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      adminUser = await User.create({
        fullName: userData.name || "Labdox Admin",
        email: ADMIN_EMAIL,
        phone: "9000000000", 
        interestReason: "Admin",
        useCase: "Admin Dashboard",
        authProvider: "google",
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
        approvalStatus: "approved",
      });
    }

    if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      await adminUser.save();
    }

    const absoluteExpiryTime = Date.now() + tokenData.expires_in * 1000;

    let googleConn = await GoogleConnection.findOne({
      userId: adminUser._id,
    });

    if (googleConn) {
      googleConn.access_token = tokenData.access_token;
      googleConn.refresh_token = tokenData.refresh_token || googleConn.refresh_token;
      googleConn.access_token_expires_in = absoluteExpiryTime;
      googleConn.id_token = tokenData.id_token || googleConn.id_token;
      googleConn.scope = tokenData.scope || googleConn.scope;
      await googleConn.save();
    } else {
      await GoogleConnection.create({
        userId: adminUser._id,
        google_id: userData.sub,
        email: adminUser.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        access_token_expires_in: absoluteExpiryTime,
        scope: tokenData.scope,
        id_token: tokenData.id_token,
      });
    }

    const appToken = adminUser.generateToken();
    console.log("Admin JWT: " + appToken);
    res.redirect(`${frontendURL}/admin/auth-success?token=${appToken}`);
  } catch (error) {
    console.error("Google Admin Callback Error:", error);
    res.redirect(`${frontendURL}/admin/auth-error?error=server_error`);
  }
};

module.exports = {
  googleUserAuth,
  googleUserCallback,
  completeGoogleRegistration,
  googleAdminAuth,
  googleAdminCallback,
};
