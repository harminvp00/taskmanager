import { z } from "zod";

const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Minimum 3 characters required")
  .max(15, "Maximum 15 characters allowed");

export const EmailSchema = z
  .string()
  .trim()
  .email()
  .transform((v) => v.toLowerCase());

export const PasswordSchema = z
  .string()
  .trim()
  .min(8, "Minimum 8 characters required")
  .max(64, "Maximum 64 characters allowed");

const OtpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must contain exactly 6 digits");


export const registerValidation = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export const loginValidation = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const verifyOtpValidation = z.object({
  email: EmailSchema,
  otp: OtpSchema,
});

export const changePasswordValidation = z
  .object({
    oldPass: PasswordSchema,
    newPass: PasswordSchema,
  })
  .refine(
    (data) => data.oldPass !== data.newPass,
    {
      message: "New password must be different from old password",
      path: ["newPass"],
    }
  );