const { z } = require("zod");

const phoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

const sendEmailOTPSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at least 3 characters" })
    .max(255, { message: "Email must not exceed 255 characters" }),
});

const verifyEmailOTPSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at least 3 characters" })
    .max(255, { message: "Email must not exceed 255 characters" }),

  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .min(5, { message: "OTP must be 5 digits" })
    .max(5, { message: "OTP must be 5 digits" }),
});

const sendPhoneOTPSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(phoneRegex, "Invalid Indian mobile number"),
});

const verifyPhoneOTPSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(phoneRegex, "Invalid Indian mobile number"),

  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .min(5, { message: "OTP must be 5 digits" })
    .max(5, { message: "OTP must be 5 digits" }),
});

module.exports = {
  sendEmailOTPSchema,
  verifyEmailOTPSchema,
  sendPhoneOTPSchema,
  verifyPhoneOTPSchema,
};