const {
  User,
  EmailOTPVerification,
  PhoneOTPVerification,
} = require("../models/user-model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/smtp.config");
const emailOTPTemplate = require("../templates/otp.template");

const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_MS = 300000;
const OTP_RESEND_COOLDOWN_MS = 60000; 

const generateOTP = async () => {
  const otp = crypto.randomInt(10000, 100000); 
  const saltRound = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(String(otp), saltRound);
  return { otp, hashedOTP };
};


const emailOTPSender = async (req, res) => {
  try {
    const { email } = req.body;

    if (req.user.email !== email) {
      return res
        .status(403)
        .json({ msg: "You can only verify your own email address" });
    }

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).json({ msg: "Email not registered" });
    }

    if (userExist.isEmailVerified) {
      return res.status(400).json({ msg: "Email is already verified" });
    }

    const existingOTP = await EmailOTPVerification.findOne({ email });

    if (existingOTP) {
      const timeSinceCreated = Date.now() - existingOTP.createdAt;
      if (timeSinceCreated < OTP_RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil(
          (OTP_RESEND_COOLDOWN_MS - timeSinceCreated) / 1000
        );
        return res.status(429).json({
          msg: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        });
      }

      if (existingOTP.attempts >= MAX_OTP_ATTEMPTS) {
        return res.status(429).json({
          msg: "Too many OTP requests. Please try again after 5 minutes.",
        });
      }

      await EmailOTPVerification.deleteOne({ email });
    }

    const { otp, hashedOTP } = await generateOTP();

    await EmailOTPVerification.create({
      userId: userExist._id,
      email,
      otp: hashedOTP,
      type: "email",
      attempts: existingOTP ? existingOTP.attempts + 1 : 0,
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Labdox-Ashutosh / Email Verification OTP",
      html: emailOTPTemplate("User", otp),
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Email OTP Send Error:", error);
    res.status(500).json({ msg: "Failed to send email OTP" });
  }
};


const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (req.user.email !== email) {
      return res
        .status(403)
        .json({ msg: "You can only verify your own email address" });
    }

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).json({ msg: "Email not registered" });
    }

    if (userExist.isEmailVerified) {
      return res.status(400).json({ msg: "Email is already verified" });
    }

    const otpRecord = await EmailOTPVerification.findOne({ email });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ msg: "OTP expired or not found. Please request a new one." });
    }

    if (Date.now() - otpRecord.createdAt > OTP_EXPIRY_MS) {
      await EmailOTPVerification.deleteOne({ email });
      return res
        .status(400)
        .json({ msg: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await EmailOTPVerification.deleteOne({ email });
      return res.status(429).json({
        msg: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const isOTPValid = await bcrypt.compare(String(otp), otpRecord.otp);
    if (!isOTPValid) {
      await EmailOTPVerification.updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await User.updateOne({ email }, { $set: { isEmailVerified: true } });

    await EmailOTPVerification.deleteOne({ email });

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Email OTP Verify Error:", error);
    res.status(500).json({ msg: "Failed to verify email OTP" });
  }
};


const phoneOTPSender = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ msg: "Please enter a valid phone number" });
    }

    if (req.user.phone !== phone) {
      return res
        .status(403)
        .json({ msg: "You can only verify your own phone number" });
    }

    const userExist = await User.findOne({ phone });
    if (!userExist) {
      return res.status(404).json({ msg: "Phone number not registered" });
    }

    if (userExist.isPhoneVerified) {
      return res.status(400).json({ msg: "Phone number is already verified" });
    }

    const existingOTP = await PhoneOTPVerification.findOne({
      userId: userExist._id,
      phone,
    });


    if (existingOTP) {
      const timeSinceLastSent = Date.now() - existingOTP.lastSentAt;
      
      if (timeSinceLastSent < OTP_RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil(
          (OTP_RESEND_COOLDOWN_MS - timeSinceLastSent) / 1000
        );
        return res.status(429).json({
          msg: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        });
      }

      if (existingOTP.attempts >= MAX_OTP_ATTEMPTS) {
        return res.status(429).json({
          msg: "Too many OTP requests. Please try again after 5 minutes.",
        });
      }

      await PhoneOTPVerification.deleteOne({ userId: userExist._id });
    }

    const { otp, hashedOTP } = await generateOTP();

    await PhoneOTPVerification.create({
      userId: userExist._id,
      phone,
      otp: hashedOTP,
      type: "phone",
      attempts: existingOTP ? existingOTP.attempts + 1 : 0,
    });

    // MOCKED SMS DELIVERY (Log to console & return mockOtp for on-screen testing)
    console.log(`\n========================================`);
    console.log(`[MOCK SMS OTP] Phone: ${phone} | OTP: ${otp}`);
    console.log(`========================================\n`);

    /* TWILIO SMS DISPATCH (COMMENTED OUT: Requires recipient whitelist in Twilio free tier)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const messageBody = `Labdox / Your OTP for phone verification is: ${otp}. It will expire in 5 minutes.`;

    try {
      const twilioResponse = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      console.log("Twilio OTP sent successfully, SID:", twilioResponse.sid);
    } catch (twilioError) {
      console.error("Twilio Gateway Failure:", twilioError.message);
    }
    */

    return res.status(200).json({ 
      success: true,
      msg: `OTP sent! (Mock OTP for testing: ${otp})`,
      mockOtp: otp 
    });
  } catch (error) {
    console.error("Internal Controller Failure:", error.message);
    return res.status(500).json({ msg: "Server error during OTP routing" });
  }
};



const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (req.user.phone !== phone) {
      return res
        .status(403)
        .json({ msg: "You can only verify your own phone number" });
    }

    const userExist = await User.findOne({ phone });
    if (!userExist) {
      return res.status(404).json({ msg: "Phone number not registered" });
    }

    if (userExist.isPhoneVerified) {
      return res.status(400).json({ msg: "Phone number is already verified" });
    }

    const otpRecord = await PhoneOTPVerification.findOne({
      userId: userExist._id,
      phone,
    });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ msg: "OTP expired or not found. Please request a new one." });
    }

    if (Date.now() - otpRecord.createdAt > OTP_EXPIRY_MS) {
      await PhoneOTPVerification.deleteOne({ userId: userExist._id });
      return res
        .status(400)
        .json({ msg: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await PhoneOTPVerification.deleteOne({ userId: userExist._id });
      return res.status(429).json({
        msg: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const isOTPValid = await bcrypt.compare(String(otp), otpRecord.otp);
    if (!isOTPValid) {
      await PhoneOTPVerification.updateOne(
        { userId: userExist._id },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await User.updateOne(
      { _id: userExist._id },
      { $set: { isPhoneVerified: true } }
    );

    await PhoneOTPVerification.deleteOne({ userId: userExist._id });

    res.status(200).json({ msg: "Phone number verified successfully" });
  } catch (error) {
    console.error("Phone OTP Verify Error:", error);
    res.status(500).json({ msg: "Failed to verify phone OTP" });
  }
};

module.exports = {
  emailOTPSender,
  verifyEmailOTP,
  phoneOTPSender,
  verifyPhoneOTP,
};