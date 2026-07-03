
import { 
  getAccessTokenFromGitHub,
  getUserFromGitHub
 } from "./git.auth.service.js";
import { getAccessToken } from '../../utils/tokens/token.js';
import "dotenv/config";


export const gitLoginUser = (req, res) => {
  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=user:email`;

  res.redirect(url);
};


export const gitCallback = async (req, res) => {

  try {
    // const { code } = req.query;
    const {code} = req.query
    const AccessToken = await getAccessTokenFromGitHub(code);
    const response = await getUserFromGitHub(AccessToken);
    
    console.log(response)
    const token = getAccessToken(
      response?.user?.id, 
      response?.user?.email, 
      response?.user?.role
    );


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });



    return res.redirect("http://localhost:5173/dashboard");

  } catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}