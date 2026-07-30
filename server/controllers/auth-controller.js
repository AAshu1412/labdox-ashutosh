const { User } = require("../models/user-model");

const home = async (req, res) => {
  try {
    res.status(200).json({ msg: "Labdox Waitlist API is running" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { fullName, email, phone, interestReason, useCase, password } =
      req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
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
      password,
      authProvider: "email_password",
      role: "user",
      isEmailVerified: false,
      isPhoneVerified: false,
      approvalStatus: "pending",
    });

    const token = userCreated.generateToken();

    res.status(201).json({
      msg: "Registration successful",
      token,
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(409)
        .json({ msg: `${field} already exists` });
    }
    console.error("Register error:", error);
    res.status(500).json({ msg: "Internal server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    if (userExist.authProvider === "google") {
      return res
        .status(400)
        .json({ msg: "This account uses Google sign-in. Please login with Google." });
    }

    const isPasswordValid = await userExist.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = userExist.generateToken();

    res.status(200).json({
      msg: "Login successful",
      token,
      userId: userExist._id.toString(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Internal server error during login" });
  }
};

const user = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ msg: userData });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user data" });
  }
};

module.exports = { home, register, login, user };