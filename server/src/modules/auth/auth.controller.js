import createHttpError from "http-errors";
import * as services from "./auth.service.js";

//complete
export const registerUser = async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      return next(createHttpError(400, "invalid fields"));
    }

    const result = await services.register(
      req.body.username,
      req.body.email,
      req.body.password,
    );

    return res.status(201).json(result);
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

//complete
export const verifyUser = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.otp) {
      return next(createHttpError(400, "invalid fields"));
    }
    const result = await services.verify(req.body.email, req.body.otp);

    return res.status(200).json(result);
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

//complete
export const verifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createHttpError(400, "provide a valid email"));
    }
    const result = await services.verifyEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

//complete
export const loginUser = async (req, res, next) => {
  try {

    if(req.cookies && req.cookies.refreshToken) {
      return next(createHttpError(400, "already logged in!"));
    }

    let { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "provide a valid email and password"));
    }

    //you can check this fields in future for more security
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    console.log(email, password)
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
    res.json({
      success: responseData.success,
      message : responseData.message,
      user: {
        userId: responseData.user.id,
        username: responseData.user.username,
        userMail: responseData.user.email,
        verify : responseData.user.verify,
        accessToken: responseData.user.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rotateToken = async (req, res, next) => {
  try {
    if(!req.cookies || !req.cookies.refreshToken) {
      return next(createHttpError(400, "User must have to login First"));
    }

    const refreshToken = req.cookies.refreshToken;

    const response = await services.rotateToken(refreshToken);

    res.cookie("refreshToken",response.user.newRefreshToken,{
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      sameSite : "strict",
      maxAge : 7 * 24 * 60 * 60 * 1000, //7d
    })

    res.status(201).json({
      success : response.success,
      message : response.message,
      user : {
        id : response.user.id,
        email : response.user.email,
        verify: response.user.verify,
        accessToken : response.user.accessToken,
      }
    })
  }
  catch (error) {
    next(error);
  }
}

//remainings

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "provide a valid email",
      });
    }
    const response = await services.forget(email);
    res.json(response);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.query.token;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid password",
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        success: false,
        message: "password is too weak",
      });
    }

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

export const changePassword = async (req, res) => {
  try {
    const email = req.user.email;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) {
      return res.status(400).json({ message: "passwords are not accepted" });
    }

    const response = await services.change(email, oldPass, newPass);
    res.send(response);
  } catch (error) {
    // update me later
    console.error(error.message);
  }
};

//complete
export const logoutUser = async (req, res ,next) => {
  try {
    if(!req.cookies || !req.cookies.refreshToken) {
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
