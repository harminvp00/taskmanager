import createHttpError from "http-errors";
import * as services from "./auth.service.js";
import * as valid from "../../utils/validations/auth.valid.js";
//complete
export const registerUser = async (req, res, next) => {
  try {
    const validation = valid.registerValidation.safeParse(req.body);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    const { username, email, password } = validation.data;

    const result = await services.register(username, email, password);

    return res.status(201).json(result);
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

//complete
export const verifyUser = async (req, res, next) => {
  try {
    const validation = valid.verifyOtpValidation.safeParse(req.body);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    const { email, otp } = validation.data;
    const result = await services.verify(email, otp);

    return res.status(200).json(result);
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

//complete
export const verifyEmail = async (req, res, next) => {
  try {
    const validation = valid.EmailSchema.safeParse(req.body.email);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    const email = validation.data;
    const result = await services.verifyEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

//complete
export const loginUser = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.refreshToken) {
      return next(createHttpError(400, "already logged in!"));
    }

    const validation = valid.loginValidation.safeParse(req.body);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    let { email, password } = validation.data;

    //you can check this fields in future for more security
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const responseData = await services.login(
      email,
      password,
      userAgent,
      ipAddress,
    );

    //set refresh token in cookie
    res.cookie("refreshToken", responseData.user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //send response
    res.status(200).json({
      success: responseData.success,
      message: responseData.message,
      user: {
        userId: responseData.user.id,
        username: responseData.user.username,
        userMail: responseData.user.email,
        verify: responseData.user.verify,
        accessToken: responseData.user.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rotateToken = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.refreshToken) {
      return next(createHttpError(400, "User must have to login First"));
    }

    const refreshToken = req.cookies.refreshToken;

    const response = await services.rotateToken(refreshToken);

    res.cookie("refreshToken", response.user.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
    });

    res.status(201).json({
      success: response.success,
      message: response.message,
      user: {
        id: response.user.id,
        email: response.user.email,
        verify: response.user.verify,
        accessToken: response.user.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

//remainings

export const forgetPassword = async (req, res) => {
  try {
    const validation = valid.EmailSchema.safeParse(req.body);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    const email = validation.data;
    const response = await services.forget(email);
    res.status(200).json(response);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.query.token;
    const validation = valid.PasswordSchema.safeParse(req.body.newPassword);

    if (!validation.success) {
      return next(createHttpError(400, validation.error.issues[0].message));
    }

    const newPassword = validation.data;

    if (!token) {
      return res.status(500).json({ message: "token is invalid" });
    }

    const response = await services.reset(token, newPassword);

    res.json({
      response,
    });
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

export const changePassword = async (req, res, next) => {
  try {
     
    const passValidation = valid.changePasswordValidation.safeParse(req.body);

    if(!passValidation.success){
      return next(createHttpError(
        400,
        passValidation.error.issues[0].message
      ))
    }

    const { oldPass, newPass } = passValidation.data;

    const response = await services.change(req.user.email, oldPass, newPass);
    res.send(response);
  } catch (error) {
      next(error)
  }
};

//complete
export const logoutUser = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.refreshToken) {
      return next(createHttpError(400, "User must have to login First"));
    }

    const refreshToken = req.cookies.refreshToken;

    const response = await services.logout(refreshToken);

    res.clearCookie("refreshToken");

    res.json(response);
  } catch (error) {
    next(error);
  }
};
