//  Register form in Task Manager
import React, { useState } from "react";
import { OAuthBox } from "../../../Components/OAuthBox";
import axios from "axios";
import { Link } from "react-router-dom";
export const Register = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_NAME: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
        const response = await axios.post('http://localhost:3000/accounts/newUser', user);
        if(response.data.success === false){
          return;
        }

        console.log(response.data);
    }catch(error){
      console.log(error);
    }
  };

  //   to handle the change of the form inputs
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUser((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="login-panel">
      <div className="login-card">
        <div className="login-form">
          <h1> Create new account </h1>
          <form
            action=""
            onSubmit={(event: React.FormEvent<HTMLFormElement>):Promise<void> =>
              handleSubmit(event)
            }>

              {/* Username */}
              <input
                name="username"
                type="text"
                placeholder="Enter the username"
                value={user.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  handleChange(e);
                }}
                required
              />

              {/* Email Address */}
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                value={user.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  handleChange(e);
                }}
                required
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Enter password"
                name="password"
                value={user.password}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  handleChange(e);
                }}
                maxLength={12}
              />
              <button type="submit" className="form-btn">
                Create New Accouts
              </button>
          </form>
        </div>

        <OAuthBox />

        <div className="box"> Already have an account, Please
          <Link style={{
            textDecoration: "none"
          }} to={'/'}> Login </Link>
        </div>
      </div>
    </div>
  );
};
