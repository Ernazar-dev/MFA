import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", form);
      if (data.mfaRequired) {
        navigate("/mfa-verify", {
          state: {
            userId: data.userId,
            totpRequired: data.totpRequired,
            emailRequired: data.emailRequired,
          },
        });
      } else {
        localStorage.setItem("token", data.token);
        setUser({ loggedIn: true, ...data.user });
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Kóp soraw jiberildi. Keyinrek qayta urınıń.");
      } else {
        toast.error(err.response?.data?.message || "Login yamasa parol naduris.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f0f4ff;
          position: relative;
          overflow: hidden;
        }

        .login-panel-left {
          display: none;
          width: 42%;
          background: linear-gradient(155deg, #1a3a8f 0%, #1e4fc2 50%, #2563eb 100%);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 960px) {
          .login-panel-left { display: flex; flex-direction: column; justify-content: center; padding: 60px; }
        }

        .left-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%),
            repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%);
          background-size: 40px 40px;
        }

        .left-circle-1 {
          position: absolute;
          width: 340px; height: 340px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          top: -80px; right: -80px;
        }
        .left-circle-2 {
          position: absolute;
          width: 220px; height: 220px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.10);
          bottom: 60px; left: -60px;
        }

        .left-content { position: relative; z-index: 1; }

        .left-logo {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 48px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 20px;
        }

        .left-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 1rem;
          line-height: 1.7;
          max-width: 280px;
        }

        .left-badge {
          margin-top: 52px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 10px 18px;
          color: rgba(255,255,255,0.85);
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .left-badge-dot {
          width: 8px; height: 8px;
          background: #4ade80;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .login-panel-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
        }

        .login-header { margin-bottom: 36px; }

        .login-header-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        @media (min-width: 960px) {
          .login-header-mobile-logo { display: none; }
        }
        .mobile-logo-icon {
          width: 40px; height: 40px;
          background: #2563eb;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e3a8a;
        }

        .login-greeting {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .login-subgreeting {
          color: #64748b;
          font-size: 0.92rem;
        }

        .form-group { margin-bottom: 20px; }

        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .form-input::placeholder { color: #94a3b8; }
        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .password-wrapper { position: relative; }
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .password-toggle:hover { color: #2563eb; }

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          margin-top: -4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.87rem;
          color: #475569;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          width: 16px; height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }
        .forgot-link {
          font-size: 0.87rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-link:hover { text-decoration: underline; }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: #1d4ed8;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .divider span { color: #94a3b8; font-size: 0.8rem; white-space: nowrap; }

        .register-link-row {
          text-align: center;
          font-size: 0.88rem;
          color: #64748b;
        }
        .register-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .register-link:hover { text-decoration: underline; }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 0.78rem;
          color: #94a3b8;
        }
      `}</style>

      <div className="login-root">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" },
          }}
        />

        {/* Sol panel */}
        <div className="login-panel-left">
          <div className="left-pattern" />
          <div className="left-circle-1" />
          <div className="left-circle-2" />
          <div className="left-content">
            <div className="left-logo">
              <ShieldCheck color="#fff" size={26} />
            </div>
            <h1 className="left-title">
              Qáwipsiz hám
              <br />
              isenimli sistema
            </h1>
            <p className="left-subtitle">
              Maǵlıwmatlarıńız tolıq qorǵalǵan. Tek siz olardı basqara alasız.
            </p>
            <div className="left-badge">
              <span className="left-badge-dot" />
              Barlıq sistemalar islep turıptı
            </div>
          </div>
        </div>

        {/* Oń panel — forma */}
        <div className="login-panel-right">
          <div className="login-card">
            <div className="login-header">
              <div className="login-header-mobile-logo">
                <div className="mobile-logo-icon">
                   <ShieldCheck color="#fff" size={20} />
                </div>
                <span className="mobile-logo-text">SecureApp</span>
              </div>
              <h2 className="login-greeting">Xosh keldińiz</h2>
              <p className="login-subgreeting">
                Akkauntga kiriw ushın maǵlıwmatlardı kirgiziń
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Paydalanıwshı atı</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="username kirgiziń"
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parol</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input"
                    placeholder="••••••••"
                    style={{ paddingRight: "44px" }}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Eslep qalıw
                </label>
                <a href="#" className="forgot-link">
                  Paroldi umıttıńız ba?
                </a>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Kiriw"
                )}
              </button>
            </form>

            <div className="divider">
              <span>yaki</span>
            </div>

            <div className="register-link-row">
              Akkauntińız joq pa?{" "}
              <Link to="/register" className="register-link">
                Dizimnen ótiw
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
