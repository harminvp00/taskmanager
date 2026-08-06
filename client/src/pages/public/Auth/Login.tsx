import { OAuthBox } from "../../../Components/OAuthBox";
import { Link } from "react-router-dom";
const Login = () => {
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

        <OAuthBox />

        <div className="box">
          dont have an account
          <Link
            style={{
              textDecoration: "none",
            }}
            to="/register"
          >
            Create One
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
