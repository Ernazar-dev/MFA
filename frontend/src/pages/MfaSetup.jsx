import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  CheckCircle,
  QrCode,
  KeyRound,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const MfaSetup = () => {
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const startSetup = async () => {
    try {
      const { data } = await api.get("/mfa/setup");
      setQrCode(data.qrCode);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "QR kod alıwda qáte");
    }
  };

  const verifySetup = async () => {
    try {
      const { data } = await api.post("/mfa/verify-enable", { token });
      setRecoveryCodes(data.recoveryCodes);
      if (user) {
        setUser({ ...user, mfa_enabled: true });
      }
      setStep(3);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Kóp soraw jiberildi. Keyinrek qayta urınıń.");
      } else {
        toast.error(err.response?.data?.message || "Kod qate");
      }
    }
  };

  const copyCode = (code, i) => {
    navigator.clipboard.writeText(code);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Barlıq kodlar nusqalandı");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .setup-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f0f4ff;
          overflow: hidden;
        }

        /* Left panel */
        .setup-left {
          display: none;
          width: 42%;
          background: linear-gradient(155deg, #1a3a8f 0%, #1e4fc2 50%, #2563eb 100%);
          position: relative; overflow: hidden;
        }
        @media (min-width: 960px) {
          .setup-left { display: flex; flex-direction: column; justify-content: center; padding: 60px; }
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
        .left-steps {
          margin-top: 48px;
          display: flex; flex-direction: column; gap: 0;
        }
        .left-step-item {
          display: flex; gap: 16px; padding-bottom: 28px;
          position: relative;
        }
        .left-step-item:last-child { padding-bottom: 0; }
        .step-line {
          position: absolute;
          left: 15px; top: 32px;
          width: 2px; height: calc(100% - 8px);
          background: rgba(255,255,255,0.15);
        }
        .left-step-item:last-child .step-line { display: none; }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: #fff;
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .step-circle.done { background: #22c55e; border-color: #22c55e; }
        .step-info { padding-top: 5px; }
        .step-title { font-size: 0.9rem; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .step-desc { font-size: 0.78rem; color: rgba(255,255,255,0.5); }

        .left-badge {
          margin-top: 36px;
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 10px 18px;
          color: rgba(255,255,255,0.85);
          font-size: 0.82rem; font-weight: 500;
        }
        .left-badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }

        /* Right */
        .setup-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .setup-card { width: 100%; max-width: 440px; }

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

        /* Step progress */
        .step-progress {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 36px;
        }
        .step-dot {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .step-dot-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700; color: #94a3b8;
          transition: all 0.2s;
        }
        .step-dot-circle.active { border-color: #2563eb; background: #2563eb; color: #fff; }
        .step-dot-circle.done { border-color: #22c55e; background: #22c55e; color: #fff; }
        .step-dot-label { font-size: 0.68rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
        .step-dot-label.active { color: #1d4ed8; }
        .step-connector {
          flex: 1; height: 2px;
          background: #e2e8f0;
          margin: 0 6px;
          margin-bottom: 20px;
          transition: background 0.3s;
        }
        .step-connector.done { background: #22c55e; }

        /* Card header */
        .card-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.28);
        }
        .card-icon.success {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.28);
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem; font-weight: 700;
          color: #0f172a; margin-bottom: 8px;
        }
        .card-sub { color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 28px; }

        /* Step 1 */
        .feature-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .feature-item {
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .feature-icon {
          width: 32px; height: 32px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #1d4ed8; flex-shrink: 0;
        }
        .feature-text { font-size: 0.88rem; font-weight: 500; color: #374151; }

        /* Step 2 — QR */
        .qr-wrapper {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex; justify-content: center; align-items: center;
          margin-bottom: 20px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
        }
        .qr-wrapper img { width: 180px; height: 180px; display: block; }

        .instruction-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.82rem;
          color: #92400e;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.78rem; font-weight: 700;
          color: #374151; margin-bottom: 7px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .otp-input {
          width: 100%;
          text-align: center;
          font-size: 1.8rem;
          font-family: monospace;
          letter-spacing: 0.3em;
          padding: 14px;
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
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .otp-input::placeholder { color: #cbd5e1; }

        /* Recovery codes */
        .success-banner {
          display: flex; align-items: center; gap: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
        }
        .success-banner-text { font-size: 0.88rem; font-weight: 600; color: #15803d; }

        .recovery-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .recovery-label {
          font-size: 0.72rem; font-weight: 700;
          color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .copy-all-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: 1.5px solid #e2e8f0;
          border-radius: 7px; padding: 4px 10px;
          font-size: 0.75rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
          color: #1d4ed8; cursor: pointer;
          transition: background 0.15s;
        }
        .copy-all-btn:hover { background: #eff6ff; }

        .recovery-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 8px; margin-bottom: 24px;
        }
        .recovery-code-item {
          display: flex; align-items: center; justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          padding: 10px 12px;
          font-family: monospace;
          font-size: 0.85rem;
          color: #0f172a;
          transition: border-color 0.15s;
        }
        .recovery-code-item:hover { border-color: #bfdbfe; }
        .copy-btn {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; padding: 0; display: flex;
          transition: color 0.15s;
        }
        .copy-btn:hover { color: #1d4ed8; }

        .warning-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.82rem;
          color: #dc2626;
          line-height: 1.6;
          margin-bottom: 20px;
        }

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
        .submit-btn:hover {
          background: #1e40af;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }
        .submit-btn.green {
          background: #16a34a;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
        }
        .submit-btn.green:hover {
          background: #15803d;
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4);
        }

        .security-note {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 20px; font-size: 0.78rem; color: #94a3b8;
        }
      `}</style>

      <div className="setup-root">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" },
          }}
        />

        {/* Left panel */}
        <div className="setup-left">
          <div className="left-pattern" />
          <div className="left-circle-1" />
          <div className="left-circle-2" />
          <div className="left-content">
            <div className="left-logo">
              <ShieldCheck color="#fff" size={26} />
            </div>
            <h1 className="left-title">
              MFA
              <br />
              Sozlaw
            </h1>
            <p className="left-subtitle">
              Akkauntińizdi qorǵaw ushın eki basqıshlı tastıyıqlawdı jaǵıń.
            </p>
            <div className="left-steps">
              {[
                { label: "Boslaw", desc: "MFA sazlawdı iske túsiriń" },
                {
                  label: "QR Skanerlew",
                  desc: "Authenticator programmasında skanerleń",
                },
                { label: "Rezerv kodlar", desc: "Qáwipsiz jerge saqlań" },
              ].map((s, i) => (
                <div className="left-step-item" key={i}>
                  <div className={`step-circle ${step > i + 1 ? "done" : ""}`}>
                    {step > i + 1 ? <Check size={14} /> : i + 1}
                  </div>
                  <div className="step-line" />
                  <div className="step-info">
                    <div className="step-title">{s.label}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="setup-right">
          <div className="setup-card">
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <ShieldCheck color="#fff" size={20} />
              </div>
              <span className="mobile-logo-text">SecureApp</span>
            </div>

            {/* Step progress bar */}
            <div className="step-progress">
              {["Baslaw", "QR kod", "Rezerv"].map((label, i) => (
                <React.Fragment key={i}>
                  <div className="step-dot">
                    <div
                      className={`step-dot-circle ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}
                    >
                      {step > i + 1 ? <Check size={14} /> : i + 1}
                    </div>
                    <span
                      className={`step-dot-label ${step === i + 1 ? "active" : ""}`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`step-connector ${step > i + 1 ? "done" : ""}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ---- Step 1 ---- */}
            {step === 1 && (
              <>
                <div className="card-icon">
                  <ShieldCheck color="#fff" size={26} />
                </div>
                <h2 className="card-title">MFA xızmetin sazlaw</h2>
                <p className="card-sub">
                  Eki basqıshlı autentifikaciya akkauntıńızdıń ruxsatı joq
                  kiriwden qorǵaydı.
                </p>
                <div className="feature-list">
                  {[
                    {
                      icon: <ShieldCheck size={16} />,
                      text: "Parolińiz urlansa da esap qáwipsiz qaladı",
                    },
                    {
                      icon: <QrCode size={16} />,
                      text: "Google yaki Basqa Authenticatorlar menen isleydi",
                    },
                    {
                      icon: <KeyRound size={16} />,
                      text: "Rezerv kodlar arqalı tiklew múmkin",
                    },
                  ].map((f, i) => (
                    <div className="feature-item" key={i}>
                      <div className="feature-icon">{f.icon}</div>
                      <span className="feature-text">{f.text}</span>
                    </div>
                  ))}
                </div>
                <button className="submit-btn" onClick={startSetup}>
                  Qosıwdı baslaw <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* ---- Step 2 ---- */}
            {step === 2 && (
              <>
                <div className="card-icon">
                  <QrCode color="#fff" size={26} />
                </div>
                <h2 className="card-title">QR Kodtı skanerleń</h2>
                <p className="card-sub">
                  Authenticator programmasın ashıń hám tómendegi QR kodtı
                  skanerleń.
                </p>
                <div className="qr-wrapper">
                  <img src={qrCode} alt="MFA QR Code" />
                </div>
    
                <label className="form-label">Authenticator kodı</label>
                <input
                  type="text"
                  maxLength="6"
                  inputMode="numeric"
                  className="otp-input"
                  placeholder="000000"
                  onChange={(e) => setToken(e.target.value)}
                />
                <button className="submit-btn" onClick={verifySetup}>
                  Tastıyıqlaw hám jaǵıw <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* ---- Step 3 ---- */}
            {step === 3 && (
              <>
                <div className="card-icon success">
                  <CheckCircle color="#fff" size={26} />
                </div>
                <h2 className="card-title">MFA Aktivlestirildi!</h2>
                <p className="card-sub">
                  Rezerv kodlardı qáwipsiz jerge saqlań. Olar tek bir mártebe
                  kórsetiledi.
                </p>

                <div className="success-banner">
                  <CheckCircle size={18} color="#15803d" />
                  <span className="success-banner-text">
                    MFA jaǵıldı
                  </span>
                </div>

                <div className="recovery-header">
                  <span className="recovery-label">Rezerv kodlar</span>
                  <button className="copy-all-btn" onClick={copyAll}>
                    <Copy size={12} /> Barlıǵın nusqalaw
                  </button>
                </div>

                <div className="recovery-grid">
                  {recoveryCodes.map((code, i) => (
                    <div className="recovery-code-item" key={i}>
                      <span>{code}</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyCode(code, i)}
                      >
                        {copied === i ? (
                          <Check size={13} color="#22c55e" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="warning-box">
                  ⚠️ Bul kodlar tek bir márte kórsetiledi. Olardı qáwipsiz
orınǵa saqlań - telefonsız kiriwde paydalanasız.
                </div>

                <button
                  className="submit-btn green"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboardqa qaytıw <ArrowRight size={18} />
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default MfaSetup;
