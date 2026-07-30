const { z } = require("zod");

const phoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

const googleCompleteRegistrationSchema = z.object({
  fullName: z
    .string({ required_error: "Full Name is required" })
    .trim()
    .min(3, { message: "Full Name must be at least 3 characters" })
    .max(255, { message: "Full Name must not exceed 255 characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" }),

  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .regex(phoneRegex, "Invalid Indian mobile number"),

  interestReason: z
    .string({ required_error: "Interest Reason is required" })
    .trim()
    .min(3, { message: "Interest Reason must be at least 3 characters" })
    .max(500, { message: "Interest Reason must not exceed 500 characters" }),

  useCase: z
    .string({ required_error: "Use Case is required" })
    .trim()
    .min(3, { message: "Use Case must be at least 3 characters" })
    .max(500, { message: "Use Case must not exceed 500 characters" }),

  google_id: z.string().optional(),
});

module.exports = { googleCompleteRegistrationSchema };
