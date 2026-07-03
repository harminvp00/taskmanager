import "dotenv/config";
import axios from "axios";
import { createUser, findByEmail, updateUserById } from "../auth/auth.repo.js";

const registerUser = async (user) => {
  const newUser = await createUser({
    username: user.name || user.login,
    email: user.email,
    provider: "github",
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

export const getAccessTokenFromGitHub = async (code) => {
  const payload = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  };

  const response = await axios.post(
    process.env.GITHUB_ACCESS_TOKEN_URL,
    payload,
    {
      headers: { Accept: "application/json" },
    },
  );

  const accessToken = response.data.access_token;
  return accessToken;
};

export const getUserFromGitHub = async (token) => {
  const user = await axios.get(process.env.GITHUB_USER, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  let githubUser = user.data;

  // when the github return null email, this is will call another api to get a email of user
  if (githubUser.email === null) {
    try {
      const { data: emails } = await axios.get(process.env.GITHUB_EMAILS, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    // receive array of emails, and we are finding main email
    const primaryEmail = emails.find((e) => e.primary && e.verified)?.email;

    if(primaryEmail){
      // set primary as githubUser.email
      githubUser.email = primaryEmail;
    }
    } catch(error){
      return `Failed to fetch github email ${error.response?.data || error.message}`
    }
  }

  
  const userExist = await findByEmail(githubUser.email);
  if (!userExist) {
    
    const result = await registerUser(githubUser);
    return result;
  }

  if (userExist.provider !== "github") {
    // fix:  user is not local then this will add extra null field into the database document, we prevent this later
    const git_user = await updateUserById(userExist._id, {
      passwordHash: null,
      verify: true,
      otp: null,
      otpExpiresAt: null,
      resetToken: null,
      resetTokenExpiresAta: null,
      resetTokenUsed: false,
      provider: "github",
      providerId: githubUser.id,
    });

    return {
      message: "existing user login",
      user: {
        id: git_user._id,
        username: git_user.username,
        email: git_user.email,
        provider: git_user.provider,
        role: git_user.role,
        verify: git_user.verify,
      },
    };
  }

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
