import "dotenv/config";
import { exchangeForToken, getUserFromGoogle } from "./googleAuth.service.js";
import { getAccessToken } from "../../utils/tokens/token.js";

export const googleLogin = async (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "http://localhost:3000/googleAuth/callback",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
};

export const googleCallback = async (req, res) => {
  try {
    const code = req.query;
    const accessToken = await exchangeForToken(code.code);
    const response = await getUserFromGoogle(accessToken.access_token);
    
    const token = getAccessToken(
      response?.user?.id,
      response?.user?.email,
      response?.user?.role,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
