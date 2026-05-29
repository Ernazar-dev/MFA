import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, KeyRound, Smartphone, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MfaVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const totpRequired = location.state?.totpRequired;
  const emailRequired = location.state?.emailRequired;

  const [token, setToken] = useState("");
  const [method, setMethod] = useState(totpRequired ? "TOTP" : "EMAIL");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const sendEmailCode = async () => {
    setLoading(true);
    try {
      await api.post("/mfa/request-email-otp", { userId });
      toast.success("Kod elektron pochtaǵa jiberildi");
      setMethod("EMAIL");
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Xat jiberiw sanı sheklendi.");
      } else {
        toast.error(err.response?.data?.message || "Qáte júz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint =
        method === "EMAIL"
          ? "/mfa/verify-email-otp"
          : method === "RECOVERY"
            ? "/mfa/verify-recovery"
            : "/mfa/verify-login";
      let payload =
        method === "EMAIL"
          ? { userId, otp: token }
          : method === "RECOVERY"
            ? { userId, recoveryCode: token }
            : { userId, token };

      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      setUser({ loggedIn: true, ...data.user });
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Kóp soraw jiberildi. Keyinrek qayta urınıń.");
      } else {
        toast.error(err.response?.data?.message || "Kod qate");
      }
    } finally {
      setLoading(false);
    }
  };

  const methodLabel = {
    TOTP: "Authenticator programmasındaǵı 6 tańbalı kodtı kirgiziń.",
    EMAIL: "Elektron pochtańızǵa jiberilgen kodtı kirgiziń.",
    RECOVERY: "8 tańbalı rezerv kodıńızdı kirgiziń.",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');

        .mfav-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f0f4ff;
          overflow: hidden;
        }

        /* Left panel */
        .mfav-left {
          display: none;
          width: 42%;
          background: linear-gradient(155deg, #1a3a8f 0%, #1e4fc2 50%, #2563eb 100%);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 960px) {
          .mfav-left { display: flex; flex-direction: column; justify-content: center; padding: 60px; }
        }
        .left-pattern {
          position: absolute; inset: 0; opacity: 0.08;
          background-image:
            repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%),
            repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%);
          background-size: 40px 40px;
        }
        .left-circle-1 {
          position: absolute; width: 340px; height: 340px;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.12);
          top: -80px; right: -80px;
        }
        .left-circle-2 {
          position: absolute; width: 220px; height: 220px;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.10);
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
          font-size: 2.4rem; font-weight: 700;
          color: #fff; line-height: 1.2; margin-bottom: 20px;
        }
        .left-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 1rem; line-height: 1.7; max-width: 280px;
        }
        .left-methods {
          margin-top: 48px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .left-method {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .left-method-icon {
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .left-method-text { font-size: 0.85rem; color: rgba(255,255,255,0.8); font-weight: 500; }
        .left-method-sub { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 1px; }

        .left-badge {
          margin-top: 36px;
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 10px 18px;
          color: rgba(255,255,255,0.85);
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.02em;
        }
        .left-badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }

        /* Right panel */
        .mfav-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .mfav-card { width: 100%; max-width: 420px; }

        /* Mobile logo */
        .mobile-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
        }
        @media (min-width: 960px) { .mobile-logo { display: none; } }
        .mobile-logo-icon {
          width: 40px; height: 40px; background: #2563eb;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-weight: 700; color: #1e3a8a;
        }

        /* Shield icon */
        .shield-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem; font-weight: 700;
          color: #0f172a; margin-bottom: 8px;
        }
        .card-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 32px; line-height: 1.5; }

        /* OTP Input */
        .otp-input {
          width: 100%;
          text-align: center;
          font-size: 2rem;
          font-family: monospace;
          letter-spacing: 0.3em;
          padding: 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          background: #fff;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 20px;
        }
        .otp-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .otp-input::placeholder { color: #cbd5e1; }

        /* Submit btn */
        .submit-btn {
          width: 100%; padding: 13px;
          background: #1d4ed8; color: #fff;
          border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
        }
        .submit-btn:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Method switcher */
        .method-divider {
          display: flex; align-items: center; gap: 12px; margin: 28px 0;
        }
        .method-divider::before, .method-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .method-divider span { color: #94a3b8; font-size: 0.78rem; white-space: nowrap; }

        .method-label-text {
          font-size: 0.72rem; font-weight: 700;
          color: #94a3b8; letter-spacing: 0.06em;
          text-transform: uppercase; text-align: center;
          margin-bottom: 12px;
        }

        .method-grid {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .method-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 12px 8px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          color: #94a3b8;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          flex: 1;
          max-width: 120px;
        }
        .method-btn:hover {
          border-color: #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
        }
        .method-btn.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }
        .method-btn-label {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.04em;
        }

        .security-note {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 24px; font-size: 0.78rem; color: #94a3b8;
        }
      `}</style>

      <div className="mfav-root">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" },
          }}
        />

        {/* Left panel */}
        <div className="mfav-left">
          <div className="left-pattern" />
          <div className="left-circle-1" />
          <div className="left-circle-2" />
          <div className="left-content">
            <div className="left-logo">
              <ShieldCheck color="#fff" size={26} />
            </div>
            <h1 className="left-title">
              Eki basqıshlı
              <br />
              tastıyıqlaw
            </h1>
            <p className="left-subtitle">
              Akkauntıńızdı qorǵaw ushın qosımsha qáwipsizlik qatlamı.
            </p>
            <div className="left-methods">
              {[
                {
                  icon: <Smartphone size={16} />,
                  label: "Authenticator App",
                  sub: "Google / Microsoft Authenticator",
                },
                {
                  icon: <Mail size={16} />,
                  label: "Email kodı",
                  sub: "Elektron pochtańızǵa jiberiledi",
                },
                {
                  icon: <KeyRound size={16} />,
                  label: "Rezerv kodı",
                  sub: "8 tańbalı arnawlı kod",
                },
              ].map((m, i) => (
                <div className="left-method" key={i}>
                  <div className="left-method-icon">{m.icon}</div>
                  <div>
                    <div className="left-method-text">{m.label}</div>
                    <div className="left-method-sub">{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right panel */}
        <div className="mfav-right">
          <div className="mfav-card">
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <ShieldCheck color="#fff" size={20} />
              </div>
              <span className="mobile-logo-text">SecureApp</span>
            </div>

            <div className="shield-icon">
              <ShieldCheck color="#fff" size={30} />
            </div>

            <h2 className="card-title">Tastıyıqlaw kodı</h2>
            <p className="card-sub">{methodLabel[method]}</p>

            <form onSubmit={handleVerify}>
              <input
                type="text"
                required
                autoFocus
                maxLength={method === "RECOVERY" ? 8 : 6}
                className="otp-input"
                placeholder={method === "RECOVERY" ? "••••••••" : "••••••"}
                onChange={(e) => setToken(e.target.value)}
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Kirisiwdi tastıyıqlaw"
                )}
              </button>
            </form>

            <div className="method-divider">
              <span>usıldı tańlań</span>
            </div>

            <p className="method-label-text">Tastıyıqlaw usılı</p>
            <div className="method-grid">
              {totpRequired && (
                <button
                  type="button"
                  className={`method-btn ${method === "TOTP" ? "active" : ""}`}
                  onClick={() => setMethod("TOTP")}
                >
                  <Smartphone size={20} />
                  <span className="method-btn-label">App</span>
                </button>
              )}
              {emailRequired && (
                <button
                  type="button"
                  className={`method-btn ${method === "EMAIL" ? "active" : ""}`}
                  onClick={sendEmailCode}
                >
                  <Mail size={20} />
                  <span className="method-btn-label">Email</span>
                </button>
              )}
              {totpRequired && (
                <button
                  type="button"
                  className={`method-btn ${method === "RECOVERY" ? "active" : ""}`}
                  onClick={() => setMethod("RECOVERY")}
                >
                  <KeyRound size={20} />
                  <span className="method-btn-label">Rezerv</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MfaVerify;
