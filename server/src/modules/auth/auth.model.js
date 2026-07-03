import { Schema, model } from "mongoose";

/**
 * Bugs found from this file,
 * name mismatch into the sevice file where here is we declare optExpireAt and used otpExpireAt, very small one later chnage this never cause a runtime issues but indirectly make no change in mongodb because we used strict true, which only allow this property only in mongo document, Same thing happen with the roles and we used role in services, so I am changed roles to role only
 */
const authSchema = new Schema(
  {
    // username
    username: { type: String, required: true, trim: true },

    // email address
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },

    // password in hash form
    passwordHash: { type: String, default: null },

    // provider - only for OAuth service, not for local user
    provider: { type: String, enum: ["local", "github", 'google'], default: "local" },

    // providerId - also for the user who login or register through OAuth services
    providerId: { type: String, default: null, unique: true, trim: true },

    // flag which state that email is vefified or not verified
    verify: { type: Boolean, default: false },

    // roles - to define diffrent access type
    role: { type: String, default: "user", enum: ["user", "admin"] },

    // in case where we have to verify mail 
    otp: { type: String, default: null },

    // otp expire time (10 min)
    otpExpiresAt: { type: Date, default: null },

    // reset token for forget password
    resetToken: { type: String, default: null },

    // reset token expiry 
    resetTokenExpiresAt: { type: Date, default: null },

    // reset token flag to state that the token is used or not used 
    resetTokenUsed: { type: Boolean, default: false },
  },
  { timestamps: true, strict: true },
);

const User = model("user", authSchema);
export default User;
