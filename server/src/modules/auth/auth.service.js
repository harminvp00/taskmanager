
"use strict";

// Models for auth and sessions
import sessionModel from "../session/session.model.js";
import authModel from "./auth.model.js";

// hashing, random string and encryption library
import bcrypt from "bcryptjs";
import crypto from "crypto";

// repository method (odm) (location src/modules/auth/auth.repo.js)
import {
  findByEmail,
  createUser,
  updateUserById,
  findUserByToken,
} from "./auth.repo.js";

// src/utils.token.js
import {
  getAccessToken,
  getRefreshToken,
  hashToken,
} from "../../utils/tokens/token.js";
// src/utils/resetToken.js
import { getResetToken } from "../../utils/tokens/resetToken.js";

// utils -> mails
import verificationMail from "../../utils/mail/email.verification.js";
import loginAlert from "../../utils/mail/email.loginAlert.js";
import informPasswordReset from "../../utils/mail/inform.passwordReset.js";
import accountVerifiedMail from "../../utils/mail/email.verificationAlert.js";
import resetPasswordMail from "../../utils/mail/email.resetPass.js";

/**
 * it registers a new user by checking if the email is already registered, hashing the password, generating an OTP for email verification, and sending a verification email.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {object} success message and user data
 */
export const register = async (username, email, password) => {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw new Error(
      "The provided email already registerd, Use other email to register",
    );
  }


  const passwordHash = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await createUser({
    username,
    email,
    passwordHash,
    otp,
    otpExpiresAt,
  });

  verificationMail(user.username, user.email, otp);

  return {
    success: true,
    message: "User registered successfully",
    user: {
      username: user.username,
      email: user.email,
      verify: user.verify,
    },
  };
};

/**
 *  it verifies the user by checking the provided OTP against the stored OTP and its expiration time.
 * If the verification is successful, it updates the user's verification status and sends a confirmation email.
 * @param {string} email the email of the user to verify
 * @param {string} otp the otp sent to the user email
 * @returns
 */
export const verify = async (email, otp) => {
  const user = await findByEmail(email);

  if (!user) {
    throw new Error("User is not Registered!");
  }

  if (!user.otp) {
    throw new Error("Send otp request on email to get new otp");
  }

  if (user.otp !== otp) {
    throw new Error("The provided otp is invalid! Provide valid otp");
  }

  if (new Date() > user.otpExpiresAt) {
    throw new Error("The provided otp is expired! send another otp request");
  }

  const updatedUser = await updateUserById(user._id, {
    verify: true,
    otp: null,
    otpExpiresAt: null,
  });

  await accountVerifiedMail(
    user.username,
    user.email,
    new Date().toLocaleString(),
  );

  return {
    success: true,
    message: "User has been verified! You can now login",
    user: {
      userId: user._id,
      email: user.email,
      verify: updatedUser.verify,
    },
  };
};

/**
 * it sends a verification email to the user with a new OTP if the user is not already verified and if an OTP has not been sent recently.
 * a new OTP is generated, stored in the user's record, and sent via email.
 * @param {string} email the email of the user to send the verification email
 * @returns returns an object containing a success message indicating that the verification code has been sent to the registered email.
 */
export const verifyEmail = async (email) => {
  const user = await findByEmail(email);

  if (!user) {
    throw new Error("User is not Registered!");
  }

  // good move, inspect later complete flow
  if (user.verify) {
    throw new Error("Client Error! User is Verified");
  }

  if (user.otp && new Date() < user.otpExpiresAt) {
    throw new Error("OTP hase been sent your mailbox, please check your email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await updateUserById(user._id, {
    otp,
    otpExpiresAt,
  });

  await verificationMail(user.username, user.email, otp);

  return {
    success: true,
    message: "verification code has been sent to the registered email, Kindly check your email for otp",
    user: {
      user: {
        userId: user._id,
        email: user.email,
        verify: user.verify,
      },
    },
  };
};

/**
 * it handles the login process by verifying the user's credentials, checking if the user is verified, generating a refresh token and access token, creating a session in the database, and sending a login alert email.
 * @param {string} email
 * @param {string} password
 * @param {string} userAgent the user agent string from the request headers, which provides information about the user's browser and operating system.
 * @param {string} ipAddress the IP address of the user making the request, which can be used for security and logging purposes.
 * @returns it returns an object containing the success status, access token, refresh token, and user information (id, username, email, and verification status).
 */
export const login = async (email, password, userAgent, ipAddress) => {
  // find user or verify email
  const user = await findByEmail(email);
  if (!user) {
    throw new Error("User is not Registered!");
  }

  console.log(user)
  // match pass
  const passwordHash = await bcrypt.compare(password, user.passwordHash);
  if (!passwordHash) {
    throw new Error("Client Error, Invalid password detected");
  }

  // check if user is verified on base of email verification
  if (!user.verify) {
    throw new Error("The user is not verified, verify the user via otp");
  }

  // generate refresh token and create session in database
  const refreshToken = getRefreshToken(user._id, user.email, user.role);
  const hashedRefreshToken = await hashToken(refreshToken);

  const session = await sessionModel.create({
    userId: user._id,
    hashedRefreshToken,
    userAgent,
    ipAddress,
  });

  // generate access token
  const accessToken = getAccessToken(
    user._id,
    user.email,
    user.role,
    session._id,
  );

  await loginAlert(user.username, user.email, new Date().toLocaleString());

  return {
    success: true,
    message : "Login successful, Welcome to the Task Manager!",
    user : {
      id: user._id,
      username: user.username,
      email: user.email,
      verify: user.verify,
      accessToken,
      refreshToken,
    }
  };
};

/**
 * it verifies a session based on refreshToken hash
 * if user is log in it generates access token and refreshToken and update refreshToken in current session
 * @param {string} oldRefreshToken
 * @returns send newly creatd tokens and user
 */
export const rotateToken = async (oldRefreshToken) => {
  const hashedToken = await hashToken(oldRefreshToken);

  const session = await sessionModel.findOne({
    hashedRefreshToken: hashedToken,
    revoked: false,
  });

  if (!session) {
    throw new Error("Session not found or revoked");
  }

  //when we add delete user funtionality
  //the session will be also deleted hence no need to verify user
  const user = await authModel.findById(session.userId);

  const accessToken = getAccessToken(
    user._id,
    user.role,
    user.email,
    session._id,
  );

  const newRefreshToken = getRefreshToken(user._id, user.email, user.role);

  session.hashedRefreshToken = await hashToken(newRefreshToken);
  await session.save();

  return {
    success: "true",
    message : "Token Refreshed succesfully",
    user : {
      id : user._id,
      email : user.email,
      verify : user.verify,
      accessToken,
      newRefreshToken,
    },
  };
};


/**
 * @param {string} email 
 * @returns a user if reset link send successfully
 */
export const forget = async (email) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new Error("no user exist");
  }

  // generate 32 bytes (256 bits) and convert it to hex string
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = getResetToken(token);

  await updateUserById(user._id, {
    resetToken: tokenHash,
    resetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    resetTokenUsed: false
  });

  await resetPasswordMail(user?.username, user?.email, token);

  return {
    success: true,
    message: "Token sent to mail",
  };
};

/**
 * @param {string} token 
 * @param {string} newPassword 
 * @returns a acknowledgement that the password is resets
 */
export const reset = async (token, newPassword) => {
  const tokenHash = getResetToken(token);

  const user = await findUserByToken(tokenHash);

  if (!user) {
    throw new Error("Invalid, cannot allow signin");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await updateUserById(user._id, {
    passwordHash: passwordHash,
    resetToken: null,
    resetTokenExpiresAt: null,
    resetTokenUsed: false,
  });

  await informPasswordReset(
    user.username,
    user.email,
    new Date().toLocaleString(),
  );

  return {
    success: true,
    message: "reset password successfully!",
  };
};


export const change = async (email, oldPass, newPass) => {
  const user = await findByEmail(email);

  if (!user) {
    throw new Error("No User exists");
  }

  const matchPass = await bcrypt.compare(oldPass, user.passwordHash);

  if (!matchPass) {
    throw new Error("old password is incorrect!");
  }

  const passwordHash = await bcrypt.hash(newPass, 10);
  await updateUserById(user._id, {
    passwordHash,
  });

  return {
    success: true,
    message: "Password is Changed!",
  };
};

/**
 * it handles the logout process by revoking the user's session associated with the provided refresh token. It hashes the refresh token, searches for the corresponding session in the database, and deletes it if found. If the session is not found or already revoked, it throws an error.
 * @param {string} refreshToken the refresh token provided by the user for logout, which is used to identify the session to be revoked.
 * @returns it returns an object indicating the success of the logout operation and a message confirming that the user has been logged out successfully.
 */
export const logout = async (refreshToken) => {
  const hashedRefreshToken = await hashToken(refreshToken);

  const session = await sessionModel.findOne({
    hashedRefreshToken,
    revoked: false,
  });
  if (!session) {
    return {
      success: false,
      message:
        "Refresh Token was not expected in the request! You have to login First.",
    };
  }

  const user = await authModel.findById(session.userId);

  await sessionModel.findByIdAndDelete(session._id);

  return {
    success: true,
    message: "User logged out successfully",
    user : {
      id : user._id,
      username : user.username,
      email : user.email,
      verify : user.verify,
    }
  };
};
