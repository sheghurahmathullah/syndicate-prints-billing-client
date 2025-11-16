import "./Login.css";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { login } from "../../Service/AuthService.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";

const Login = () => {
  const { setAuthData } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'employee'
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

      console.log("Login response:", data);

    try {
      const response = await login(data);

      if(loginType === "admin" && response.data.role !== "ROLE_ADMIN") {
        toast.error("Access denied: Not an admin account. Login in employee tab.");
        setLoading(false);
        return;
      }

      if(loginType === "employee" && response.data.role !== "ROLE_USER") {
        toast.error("Access denied: Not an employee account. Login in admin tab.");
        setLoading(false);
        return;
      }
      
      if (response.status === 200) {
        toast.success("Login successfull");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        setAuthData(response.data.token, response.data.role);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Email/Password Invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-bg-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="login-card">
        {/* Logo/Brand Section */}
        <div className="login-header">
          <div className="brand-icon">
            <img src={assets.logo} alt="Syndicate Prints Logo" height="60" />
          </div>
          <h1 className="brand-title">Syndicate Prints</h1>
          <p className="brand-subtitle">Professional Printing Solutions</p>
        </div>

        {/* Toggle Switch for Admin/Employee */}
        <div className="login-toggle-container">
          <button
            type="button"
            className={`toggle-btn ${loginType === "admin" ? "active" : ""}`}
            onClick={() => setLoginType("admin")}
          >
            <i className="bi bi-person-badge"></i>
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`toggle-btn ${loginType === "employee" ? "active" : ""}`}
            onClick={() => setLoginType("employee")}
          >
            <i className="bi bi-person"></i>
            <span>Employee</span>
          </button>
          <div
            className={`toggle-slider ${
              loginType === "employee" ? "right" : ""
            }`}
          ></div>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <div className="form-header">
            <h2>{loginType === "admin" ? "Admin Login" : "Employee Login"}</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form onSubmit={onSubmitHandler} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="bi bi-envelope"></i>
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  className="form-input"
                  onChange={onChangeHandler}
                  value={data.email}
                  required
                />
                <div className="input-icon">
                  <i className="bi bi-person-circle"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="bi bi-lock"></i>
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  className="form-input"
                  onChange={onChangeHandler}
                  value={data.password}
                  required
                />
                <div className="input-icon">
                  <i className="bi bi-shield-lock"></i>
                </div>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat rotating"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="info-text">
              <i className="bi bi-info-circle"></i>
              {loginType === "admin"
                ? "Admin accounts have full system access"
                : "Employee accounts have limited access"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
