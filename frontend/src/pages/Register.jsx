import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  User,
  Lock,
  ShieldCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/register", form);
      toast.success("Akkaunt tabıslı jaratıldı! Kiriw...");
      localStorage.setItem("token", data.token);
      setUser({ loggedIn: true, ...data.user });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Kóp soraw jiberildi. Keyinrek qayta urınıń.");
      } else if (err.response?.data?.errors) {
        const errorMsg = err.response.data.errors.map(e => e.msg).join(", ");
        toast.error(errorMsg);
      } else {
        toast.error(
          err.response?.data?.error || "Dizimnen ótiwde qáte júz berdi",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');

        .reg-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f0f4ff;
          overflow: hidden;
        }

        /* ---- Sol dekorativ panel ---- */
        .reg-panel-left {
          display: none;
          width: 42%;
          background: linear-gradient(155deg, #1a3a8f 0%, #1e4fc2 50%, #2563eb 100%);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 960px) {
          .reg-panel-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px;
          }
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

        /* Steps list */
        .left-steps {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .left-step {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .step-num {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .step-text {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.75);
        }

        .left-badge {
          margin-top: 40px;
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

        /* ---- O'ng forma paneli ---- */
        .reg-panel-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .reg-card {
          width: 100%;
          max-width: 440px;
        }

        .reg-header { margin-bottom: 32px; }

        .reg-header-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        @media (min-width: 960px) {
          .reg-header-mobile-logo { display: none; }
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

        .reg-greeting {
          font-family: 'Playfair Display', serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .reg-subgreeting {
          color: #64748b;
          font-size: 0.92rem;
        }

        /* Form */
        .form-group { margin-bottom: 18px; }

        .form-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .input-wrapper { position: relative; }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
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
        .form-input:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: #2563eb;
        }

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

        /* Password strength bar */
        .strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }
        .strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: #e2e8f0;
          transition: background 0.3s;
        }
        .strength-seg.active-weak   { background: #ef4444; }
        .strength-seg.active-medium { background: #f59e0b; }
        .strength-seg.active-strong { background: #22c55e; }
        .strength-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 4px;
        }

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
          margin-top: 24px;
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
          margin: 24px 0;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .divider span { color: #94a3b8; font-size: 0.8rem; white-space: nowrap; }

        .login-link-row {
          text-align: center;
          font-size: 0.88rem;
          color: #64748b;
        }
        .login-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .login-link:hover { text-decoration: underline; }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .terms-note {
          text-align: center;
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 12px;
          line-height: 1.6;
        }
        .terms-note a { color: #2563eb; text-decoration: none; }
        .terms-note a:hover { text-decoration: underline; }
      `}</style>

      <div className="reg-root">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" },
          }}
        />

        {/* ---- Chap panel ---- */}
        <div className="reg-panel-left">
          <div className="left-pattern" />
          <div className="left-circle-1" />
          <div className="left-circle-2" />
          <div className="left-content">
            <div className="left-logo">
              <UserPlus color="#fff" size={26} />
            </div>
            <h1 className="left-title">
              Sistemaǵa
              <br />
              qosılıń
            </h1>
            <p className="left-subtitle">
              Bir neshe qádemde akkauntıńızdı jaratıń hám sistemadan tolıq
paydalanıń.
            </p>

            <div className="left-steps">
              <div className="left-step">
                <span className="step-num">1</span>
                <span className="step-text">Maǵlıwmatlarıńızdı kirgiziń</span>
              </div>
              <div className="left-step">
                <span className="step-num">2</span>
                <span className="step-text">Elektron pochtańızdı tastıyıqlań</span>
              </div>
              <div className="left-step">
                <span className="step-num">3</span>
                <span className="step-text">Sistemadan paydalanıń</span>
              </div>
            </div>

          </div>
        </div>

        {/* ---- Oń panel ---- */}
        <div className="reg-panel-right">
          <div className="reg-card">
            <div className="reg-header">
              <div className="reg-header-mobile-logo">
                <div className="mobile-logo-icon">
                  <ShieldCheck color="#fff" size={20} />
                </div>
                <span className="mobile-logo-text">SecureApp</span>
              </div>
              <h2 className="reg-greeting">Akkaunt jaratıw</h2>
              <p className="reg-subgreeting">
                Barlıq maydanlardı toltırıp dizimnen ótiń
              </p>
            </div>

            <form onSubmit={handleRegister}>
              {/* Username */}
              <div className="form-group">
                <label className="form-label">Paydalanıwshı atı</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <User size={16} />
                  </span>
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
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Elektron pochta</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="example@gmail.com"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Parol */}
              <div className="form-group">
                <label className="form-label">Parol</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Lock size={16} />
                  </span>
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
                <PasswordStrength password={form.password} />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Dizimnen ótiw
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>yaki</span>
            </div>

            <div className="login-link-row">
              Akkauntińız bar ma?{" "}
              <Link to="/login" className="login-link">
                Kiriw
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

/* Parol kúshi indikatorı */
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ["", "Ázzi", "Orta", "Kúshli"];
  const segClass = (i) => {
    if (strength === 0 || i >= strength) return "strength-seg";
    if (strength === 1) return "strength-seg active-weak";
    if (strength === 2) return "strength-seg active-medium";
    return "strength-seg active-strong";
  };

  return (
    <>
      <div className="strength-bar">
        <div className={segClass(0)} />
        <div className={segClass(1)} />
        <div className={segClass(2)} />
      </div>
      {password && (
        <p className="strength-label">
          Parol kúshi: <strong>{labels[strength]}</strong>
        </p>
      )}
    </>
  );
}

export default Register;
