import { useState } from "react";c
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE || "http://187.127.154.131:5000";

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);
    setSubmitError("");

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      const rawText = await response.text();
      console.log("Raw login response:", rawText);

      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error("Login JSON parse error:", parseError);
        setSubmitError("Backend returned invalid response");
        return;
      }

      console.log("Login response status:", response.status);
      console.log("Login response data:", data);

      if (!response.ok) {
        setSubmitError(data.message || "Invalid email or password");
        return;
      }

      if (!data.user) {
        setSubmitError("User data not received");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userName", data.user.name || "");
      localStorage.setItem("userEmail", data.user.email || "");
      localStorage.setItem("userId", String(data.user.id || ""));

      if (formData.remember) {
        localStorage.setItem("rememberedEmail", formData.email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="overlay" />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="tabs">
            <span className="active">Sign in</span>
            <Link to="/signup">Sign up</Link>
          </div>

          <h2>Welcome Back!</h2>
          <p className="subtitle">Please login to your account</p>

          <form onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <div className={`input-box ${errors.email ? "input-error" : ""}`}>
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>
              <div className={`input-box ${errors.password ? "input-error" : ""}`}>
                <Lock size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="options">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>

              <button type="button" className="forgot">
                Forgot Password?
              </button>
            </div>

            {submitError && <div className="submit-error">{submitError}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 40px 30px 40px 80px;
          background: url("/bg.png") no-repeat center center;
          background-size: cover;
          font-family: Inter, sans-serif;
          position: relative;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.15),
            rgba(0,0,0,0.4),
            rgba(0,0,0,0.7)
          );
        }

        .auth-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          padding: 34px 32px 28px;
          border-radius: 24px;
          color: #fff;
          background: linear-gradient(
            180deg,
            rgba(9, 20, 42, 0.86) 0%,
            rgba(6, 15, 32, 0.78) 100%
          );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          margin-right: 120px;
        }

        .tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 26px;
        }

        .tabs span,
        .tabs a {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.68);
          text-decoration: none;
          position: relative;
        }

        .tabs .active {
          color: #ffffff;
          font-weight: 700;
        }

        .tabs .active::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7fc8ff, #3b8cff);
          box-shadow: 0 0 12px rgba(88, 170, 255, 0.35);
        }

        h2 {
          margin: 0;
          font-size: 32px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .subtitle {
          margin: 8px 0 24px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.72);
        }

        .input-group {
          margin-bottom: 18px;
        }

        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 9px;
          color: rgba(255, 255, 255, 0.92);
        }

        .input-box {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 54px;
          padding: 0 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          transition: all 0.22s ease;
        }

        .input-box:focus-within {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(92, 176, 255, 0.7);
          box-shadow: 0 0 0 4px rgba(92, 176, 255, 0.12);
        }

        .input-box.input-error {
          border-color: rgba(255, 95, 95, 0.8);
          box-shadow: 0 0 0 3px rgba(255, 95, 95, 0.12);
        }

        .input-box svg {
          color: rgba(255, 255, 255, 0.72);
          flex-shrink: 0;
        }

        .input-box input {
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
        }

        .input-box input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .eye-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 2px 0 20px;
          gap: 12px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
        }

        .remember input {
          accent-color: #4da6ff;
          width: 16px;
          height: 16px;
        }

        .forgot {
          background: none;
          border: none;
          color: #6fc1ff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 0;
        }

        .field-error {
          margin: 8px 0 0;
          font-size: 12px;
          color: #ffb4b4;
        }

        .submit-error {
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255, 80, 80, 0.12);
          border: 1px solid rgba(255, 80, 80, 0.22);
          color: #ffd3d3;
          font-size: 12px;
        }

        .auth-btn {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(180deg, #5db3ff, #337ff5);
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 16px 34px rgba(51, 127, 245, 0.34);
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 38px rgba(51, 127, 245, 0.42);
        }

        .auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .auth-page {
            padding: 30px;
          }

          .auth-card {
            margin-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .auth-page {
            justify-content: center;
            padding: 20px;
          }

          .auth-wrapper {
            justify-content: center;
          }

          .auth-card {
            max-width: 100%;
            margin-right: 0;
            padding: 24px 20px;
          }

          .options {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
