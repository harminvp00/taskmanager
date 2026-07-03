import "dotenv/config";
import { createUser, findByEmail, updateUserById } from "../auth/auth.repo.js";

const saveUserinDB = async (user) => {
  const newUser = await createUser({
    username: user.given_name,
    email: user.email,
    provider: "google",
    providerId: user.id,
    verify: true,
  });

  return {
    message: "create a new user",
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      provider: newUser.provider,
      role: newUser.role,
      verify: newUser.verify,
    },
  };
};

export const exchangeForToken = async (code) => {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/googleAuth/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();
  return tokens;
};

export const getUserFromGoogle = async (access_token) => {
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  const gogoleUser = await userResponse.json();
  const userExist = await findByEmail(gogoleUser.email);

  // check same mail exist into the document or not 
  if (!userExist) {
    const result = await saveUserinDB(gogoleUser);
    return result;
  }

  // if provide not set then set that before return 
  if(userExist.provider !== 'google'){
    const g_user = await updateUserById(userExist._id, {
      passwordHash: null,
      verify: true,
      otp: null,
      otpExpiresAt: null,
      resetToken: null,
      resetTokenExpiresAta: null,
      resetTokenUsed: false,
      provider: 'google',
      providerId: gogoleUser.id
    })

    return {
    message: "existing user login",
    user: {
      id: g_user._id,
      username: g_user.username,
      email: g_user.email,
      provider: g_user.provider,
      role: g_user.role,
      verify: g_user.verify,
    },
  };
  }

  // if provider set then direct return 
  return {
    message: "existing user login",
    user: {
      id: userExist._id,
      username: userExist.username,
      email: userExist.email,
      provider: userExist.provider,
      role: userExist.role,
      verify: userExist.verify,
    },
  };
};
