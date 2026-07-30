const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^(?:\+91)?[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },
    interestReason: {
      type: String,
      required: [true, "Interest reason is required"],
      trim: true,
    },
    useCase: {
      type: String,
      required: [true, "Use case is required"],
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "email_password";
      },
    },
    authProvider: {
      type: String,
      enum: ["email_password", "google"],
      default: "email_password",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for email_password auth)
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password") || user.authProvider !== "email_password") {
    return next();
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.generateToken = function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        phone: this.phone,
        role: this.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
  }
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const emailOTPVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    otp: {
      type: String, // Stored as bcrypt hash
      required: true,
    },
    type: {
      type: String,
      enum: ["email"],
      default: "email",
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {                         // auto delete after 5 minute (300 seconds)
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  { timestamps: false }
);

const phoneOTPVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^(?:\+91)?[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["phone"],
      default: "phone",
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  { timestamps: false }
);

const googleConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    google_id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    access_token: { type: String, required: true },
    refresh_token: { type: String },
    token_type: { type: String, required: true },
    scope: { type: String, required: true },
    access_token_expires_in: { type: Number, required: true },
    id_token: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const EmailOTPVerification = mongoose.model("EmailOTPVerification", emailOTPVerificationSchema);
const PhoneOTPVerification = mongoose.model("PhoneOTPVerification", phoneOTPVerificationSchema);
const GoogleConnection = mongoose.model("GoogleConnection", googleConnectionSchema);

module.exports = {User, EmailOTPVerification, PhoneOTPVerification, GoogleConnection,};