import React from "react";

export const OAuthBox = () => {
  // login using git
  function loginUsingGit(): void {
    window.location.href = "http://localhost:3000/gitAuth/login";
  }

  // login with in google
  function loginUsingGoogle(): void {
    window.location.href = "http://localhost:3000/googleAuth/login";
  }

  return (
    <div className="directLogin">
      {/*  google oauth caller */}
      <button onClick={() => loginUsingGoogle()}>
        <img src="/google.png" alt="" />
        <span> Login using Google </span>
      </button>

      {/* github oauth caller */}
      <button onClick={() => loginUsingGit()}>
        <img src="/github.png" alt="" />
        <span> Login using GitHub </span>
      </button>
    </div>
  );
};
