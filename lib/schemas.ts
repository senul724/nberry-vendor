import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const passwordLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const otpLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain digits only"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain digits only"),
});

export const forgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain digits only"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirm_password: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters"),
  content: z
    .string()
    .min(1, "Content is required"),
});

export const createAppSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "App name must be at least 2 characters")
    .max(100, "App name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  logo: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      "Logo must be a valid HTTP/HTTPS URL"
    )
    .optional()
    .or(z.literal("")),
  unicast_callback_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https:\/\/.+/i.test(val),
      "Unicast callback URL must be a valid secure HTTPS URL (e.g. https://api.example.com/webhook)"
    )
    .optional()
    .or(z.literal("")),
});

export const updateAppSchema = createAppSchema;

export const sendNotificationSchema = z
  .object({
    type: z.enum(["broadcast", "unicast"]),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(150, "Title cannot exceed 150 characters"),
    message: z
      .string()
      .trim()
      .min(1, "Message content is required")
      .max(2000, "Message cannot exceed 2000 characters"),
    recipient_id: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "unicast" && (!data.recipient_id || !data.recipient_id.trim())) {
        return false;
      }
      return true;
    },
    {
      message: "Recipient ID is required for Unicast direct memos",
      path: ["recipient_id"],
    }
  );

