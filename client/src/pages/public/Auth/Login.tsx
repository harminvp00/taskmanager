


const Login = () => {

  function loginUsingGit(): void {
    window.location.href = "http://localhost:3000/gitAuth/login";
  }

  function loginUsingGoogle(): void {
    window.location.href = "http://localhost:3000/googleAuth/login";
  }

  return (
    <div className="login-panel">
      <div className="login-card">
        <div className="login-form">
          <h1> Task manager</h1>
          <form action="">
            <input
              name="emailField"
              type="email"
              placeholder="email address"
              required
            />
            <input
              type="password"
              placeholder="password"
              name="passwordField"
              required
              maxLength={12}
            />
            <button className="form-btn">Login</button>
          </form>
        </div>

        <div className="directLogin">

          {/*  google oauth caller */}
          <button onClick={() => loginUsingGoogle()}>
            <img src="/google.png" alt="" />
            <span>login using google</span>
          </button>

          {/* github oauth caller */}
          <button onClick={() => loginUsingGit()}>
            <img src="/github.png" alt="" />
            <span>login using github</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
