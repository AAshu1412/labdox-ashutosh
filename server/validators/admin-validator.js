const { z } = require("zod");

const approveUserSchema = z.object({
});

const rejectUserSchema = z.object({
});

const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Full Name must be at least 3 characters" })
      .max(255, { message: "Full Name must not exceed 255 characters" })
      .optional(),

    interestReason: z
      .string()
      .trim()
      .min(3, { message: "Interest Reason must be at least 3 characters" })
      .max(500)
      .optional(),

    useCase: z.string().trim().min(3).max(500).optional(),
  })
  .strict(); // Prevent unknown fields from being passed

module.exports = { approveUserSchema, rejectUserSchema, updateUserSchema };
