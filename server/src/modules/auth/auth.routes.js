import { Router } from "express";
import {
  changePassword,
  forgetPassword,
  loginUser,
  registerUser,
  resetPassword,
  verifyUser,
  verifyEmail,
  logoutUser,
  rotateToken,
} from "./auth.controller.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
const router = Router();

/**
 * @route POST /accounts/newUser
 * @desc Register a new user
 * @access public
 */
router.post("/newUser", registerUser);

/**
 * @route PATCH /accounts/verify-user
 * @desc Verify a user with OTP
 * @access public
 */
router.patch("/verify-user", verifyUser);

/**
 * @route POST /accounts/verifyEmail
 * @desc Send a verification email with otp to the user
 * @access public
 */
router.post("/send-otp", verifyEmail);

/**
 * @route POST /accounts/login
 * @desc Login a user and return a JWT token to response body and referesh token to cookie and create session in database
 * @access public
 */
router.post("/login", loginUser);

/**
 * @route POST /accounts/refresh
 * @desc Refresh the access token using the refresh token from cookie and create a new session in database
 * @access public
 */
router.post("/rotate", rotateToken);

/**
 * @route POST /accounts/forgetPassword
 * @description Take Email in request from user, generate token, it expiry and send it to the email address if that exist into the database.
 * @access public 
 */
router.post("/forgetPassword", forgetPassword);

/**
 * @route PATCH /accounts/resetPassword
 * @description server receive the token through the client, server verify and found same token in database with condition token should match exactly, have some time to expire, and never used before
 * @access public
 */
router.patch("/resetPassword", resetPassword);

/**
 * @route PATCH /accounts/changePassword
 * @description this is private route and only authenticate user can access this server, user send hid old password, new password and his token on the server, server check the token and old password, if both okay the old_pass replace by the new_pass, use "authMiddleware" to vefify the token before request and response
 * @access private
 */
router.patch("/changePassword", authMiddleware, changePassword);

/**
 * @route POST /accounts/logout
 * @desc Logout a user and delete the session from database and clear the cookie
 * @access private
 */
router.post("/logout", logoutUser)

export default router;
