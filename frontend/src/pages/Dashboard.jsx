import React, { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ShieldCheck,
  ShieldOff,
  Globe,
  LogOut,
  History,
  RefreshCw,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [mfaToken, setMfaToken] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, setUser, logout } = useAuth();

  const [emailToken, setEmailToken] = useState("");
  const [showEmailSetupModal, setShowEmailSetupModal] = useState(false);
  const [showEmailDisableModal, setShowEmailDisableModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const startEmailSetup = async () => {
    setShowEmailSetupModal(true);
    setEmailLoading(true);
    try {
      await api.post("/mfa/email/setup");
      toast.success("Tastıyıqlaw kodı elektron pochtanızǵa jiberildi");
    } catch (err) {
      setShowEmailSetupModal(false);
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Xat jiberiw sanı sheklendi.");
      } else {
        toast.error(err.response?.data?.message || "Kod jiberiwde qáte");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEnableEmailMFA = async () => {
    try {
      await api.post("/mfa/email/enable", { token: emailToken });
      toast.success("Email 2FA jaǵıldı");
      setShowEmailSetupModal(false);
      setEmailToken("");
      if (user) {
        setUser({ ...user, email_mfa_enabled: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Kod qáte");
    }
  };

  const handleDisableEmailMFA = async () => {
    try {
      await api.post("/mfa/email/disable");
      toast.success("Email 2FA óshirildi");
      setShowEmailDisableModal(false);
      if (user) {
        setUser({ ...user, email_mfa_enabled: false });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Qáte júz berdi");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get("/audit-logs");
      setLogs(data);
    } catch (err) {
      toast.error("Loglardı júklewde qáte");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      await api.post("/mfa/disable", { token: mfaToken });
      toast.success("MFA óshirildi");
      setShowDisableModal(false);
      if (user) {
        setUser({ ...user, mfa_enabled: false });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data || "Kóp soraw jiberildi. Keyinrek qayta urınıń.");
      } else {
        toast.error(err.response?.data?.message || "Kod qáte");
      }
    }
  };

  const getActionColor = (action = "") => {
    if (action.toLowerCase().includes("login")) return "badge-green";
    if (
      action.toLowerCase().includes("fail") ||
      action.toLowerCase().includes("qate")
    )
      return "badge-red";
    if (action.toLowerCase().includes("mfa")) return "badge-blue";
    return "badge-gray";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f0f4ff;
          display: flex;
          flex-direction: column;
        }

        /* ---- Navbar ---- */
        .dash-nav {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .dash-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-icon {
          width: 36px; height: 36px;
          background: #1d4ed8;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          padding: 6px 14px 6px 8px;
        }
        .nav-avatar {
          width: 28px; height: 28px;
          background: #dbeafe;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #1d4ed8;
        }
        .nav-username {
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
        }
        .nav-logout {
          background: none;
          border: none;
          cursor: pointer;
          width: 36px; height: 36px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8;
          transition: background 0.15s, color 0.15s;
        }
        .nav-logout:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* ---- Main layout ---- */
        .dash-main {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 36px 28px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 960px) {
          .dash-main {
            grid-template-columns: 280px 1fr;
          }
        }

        /* ---- Sidebar ---- */
        .sidebar { display: flex; flex-direction: column; gap: 20px; }

        .sidebar-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .sidebar-section-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .mfa-status-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .mfa-status-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .mfa-status-text {
          font-size: 0.88rem;
          font-weight: 600;
          color: #15803d;
        }

        .sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #374151;
          transition: background 0.15s, border-color 0.15s;
          margin-bottom: 10px;
          text-decoration: none;
        }
        .sidebar-btn:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }
        .sidebar-btn:last-child { margin-bottom: 0; }

        .sidebar-btn-danger {
          border-color: #fecaca;
          background: #fff;
          color: #dc2626;
        }
        .sidebar-btn-danger:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #b91c1c;
        }

        /* Stats row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
        }
        .stat-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* ---- Logs table card ---- */
        .logs-section { display: flex; flex-direction: column; gap: 20px; }

        .logs-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .logs-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logs-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }
        .logs-card-title-icon {
          width: 32px; height: 32px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #1d4ed8;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 7px 13px;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #1d4ed8;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .refresh-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
        .refresh-btn svg { transition: transform 0.4s; }
        .refresh-btn.spinning svg { animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .logs-table { width: 100%; border-collapse: collapse; }
        .logs-thead tr {
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }
        .logs-thead th {
          padding: 11px 20px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: left;
        }
        .logs-thead th:last-child { text-align: right; }
        .logs-tbody tr {
          border-bottom: 1px solid #f8fafc;
          transition: background 0.12s;
        }
        .logs-tbody tr:last-child { border-bottom: none; }
        .logs-tbody tr:hover { background: #f8fafc; }
        .logs-tbody td {
          padding: 14px 20px;
          font-size: 0.88rem;
          color: #475569;
        }
        .logs-tbody td:last-child {
          text-align: right;
          font-family: monospace;
          font-size: 0.82rem;
        }

        /* Action badge */
        .action-cell { display: flex; align-items: center; gap: 10px; }
        .badge {
          display: inline-block;
          padding: 3px 9px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .badge-green { background: #dcfce7; color: #15803d; }
        .badge-red   { background: #fee2e2; color: #dc2626; }
        .badge-blue  { background: #dbeafe; color: #1d4ed8; }
        .badge-gray  { background: #f1f5f9; color: #64748b; }

        .ip-cell { display: flex; align-items: center; gap: 5px; justify-content: flex-end; }

        .empty-logs {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        /* ---- Modal ---- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-card {
          background: #fff;
          border-radius: 20px;
          max-width: 380px;
          width: 100%;
          padding: 36px 32px;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-icon {
          width: 60px; height: 60px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          color: #dc2626;
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .modal-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 24px;
        }
        .modal-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          text-align: center;
          font-size: 1.8rem;
          font-family: monospace;
          letter-spacing: 0.25em;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 24px;
        }
        .modal-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          background: #fff;
        }
        .modal-actions { display: flex; gap: 12px; }
        .modal-cancel {
          flex: 1;
          padding: 12px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #64748b;
          cursor: pointer;
          transition: background 0.15s;
        }
        .modal-cancel:hover { background: #f1f5f9; }
        .modal-confirm {
          flex: 1;
          padding: 12px;
          background: #dc2626;
          border: none;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          transition: background 0.15s, transform 0.15s;
        }
        .modal-confirm:hover { background: #b91c1c; transform: translateY(-1px); }
      `}</style>

      <div className="dash-root">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" },
          }}
        />

        {/* Navbar */}
        <header className="dash-nav">
          <div className="dash-nav-inner">
            <div className="nav-logo">
              <div className="nav-logo-icon">
                <ShieldCheck color="#fff" size={20} />
              </div>
              <span className="nav-logo-text">Beka-IP</span>
            </div>
            <div className="nav-right">
              <div className="nav-user">
                <div className="nav-avatar">
                  <User size={14} />
                </div>
                <span className="nav-username">@{user?.username}</span>
              </div>
              <button className="nav-logout" onClick={logout} title="Shıǵıw">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="dash-main">
          {/* ---- Sidebar ---- */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <p className="sidebar-section-label">Google Auth MFA</p>
              {user?.mfa_enabled ? (
                <>
                  <div className="mfa-status-badge">
                    <span className="mfa-status-dot" />
                    <span className="mfa-status-text">MFA Aktiv</span>
                  </div>
                  <Link to="/mfa-setup" className="sidebar-btn">
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Settings size={15} /> MFA Qayta sazlaw
                    </span>
                    <ChevronRight size={15} />
                  </Link>
                  <button
                    onClick={() => setShowDisableModal(true)}
                    className="sidebar-btn sidebar-btn-danger"
                    style={{ marginBottom: 20 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldOff size={15} /> MFA-ni óshiriw
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <div className="mfa-status-badge" style={{ background: '#fef2f2', borderColor: '#fecaca', marginBottom: 16 }}>
                    <span className="mfa-status-dot" style={{ background: '#dc2626' }} />
                    <span className="mfa-status-text" style={{ color: '#dc2626' }}>MFA qosılmaǵan</span>
                  </div>
                  <Link to="/mfa-setup" className="sidebar-btn" style={{ borderColor: '#bbf7d0', background: '#f0fdf4', color: '#15803d', marginBottom: 20 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldCheck size={15} /> MFA Sazlaw (Qosıw)
                    </span>
                    <ChevronRight size={15} />
                  </Link>
                </>
              )}

              <p className="sidebar-section-label" style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, marginTop: 10 }}>Email 2FA</p>
              {user?.email_mfa_enabled ? (
                <>
                  <div className="mfa-status-badge">
                    <span className="mfa-status-dot" />
                    <span className="mfa-status-text">Email 2FA Aktiv</span>
                  </div>
                  <button
                    onClick={() => setShowEmailDisableModal(true)}
                    className="sidebar-btn sidebar-btn-danger"
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldOff size={15} /> Email 2FA-ni óshiriw
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <div className="mfa-status-badge" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                    <span className="mfa-status-dot" style={{ background: '#dc2626' }} />
                    <span className="mfa-status-text" style={{ color: '#dc2626' }}>Email 2FA qosılmaǵan</span>
                  </div>
                  <button
                    onClick={startEmailSetup}
                    disabled={emailLoading}
                    className="sidebar-btn"
                    style={{ borderColor: '#bbf7d0', background: '#f0fdf4', color: '#15803d' }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldCheck size={15} /> Email 2FA Qosıw
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </>
              )}
            </div>

            {/* Mini stats */}
            <div className="sidebar-card">
              <p className="sidebar-section-label">Statistika</p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <p className="stat-label">Jámi kiriwler</p>
                  <p className="stat-value" style={{ fontSize: "1.3rem" }}>
                    {logs.length}
                  </p>
                </div>
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                  <p className="stat-label">Sońǵı háreket</p>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                    {logs[0]
                      ? new Date(logs[0].created_at).toLocaleDateString("uz-UZ")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ---- Logs ---- */}
          <div className="logs-section">
            <div className="logs-card">
              <div className="logs-card-header">
                <div className="logs-card-title">
                  <div className="logs-card-title-icon">
                    <History size={16} />
                  </div>
                  Audit jurnalı
                </div>
                <button
                  className={`refresh-btn ${refreshing ? "spinning" : ""}`}
                  onClick={fetchLogs}
                >
                  <RefreshCw size={14} />
                  Jańalaw
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="logs-table">
                  <thead className="logs-thead">
                    <tr>
                      <th>Háreket</th>
                      <th>Waqıt</th>
                      <th>IP mánzil</th>
                    </tr>
                  </thead>
                  <tbody className="logs-tbody">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="empty-logs">
                          Házirshe hesh qanday háreket joq
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <div className="action-cell">
                              <span
                                className={`badge ${getActionColor(log.action)}`}
                              >
                                {log.action}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: "#64748b" }}>
                            {new Date(log.created_at).toLocaleString("uz-UZ")}
                          </td>
                          <td>
                            <div className="ip-cell">
                              <Globe size={13} style={{ color: "#94a3b8" }} />
                              {log.ip_address}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Disable MFA Modal */}
        {showDisableModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-icon">
                <ShieldOff size={28} />
              </div>
              <h3 className="modal-title">Tastıyıqlaw kerek</h3>
              <p className="modal-desc">
                MFA óshiriliwi akkauntıńızdı qáwipke qoyadı. Dawam etiw ushın
                OTP kodıńızdı kirgiziń.
              </p>
              <input
                type="text"
                maxLength="6"
                inputMode="numeric"
                className="modal-input"
                placeholder="000000"
                onChange={(e) => setMfaToken(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDisableModal(false)}
                >
                  Biykar qılıw
                </button>
                <button className="modal-confirm" onClick={handleDisableMFA}>
                  Óshiriw
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email MFA Setup Modal */}
        {showEmailSetupModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              {emailLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                  <RefreshCw className="spinning" size={40} style={{ color: '#1d4ed8', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                  <h3 className="modal-title">Kod jiberilmekte...</h3>
                  <p className="modal-desc" style={{ textAlign: 'center' }}>
                    Tastıyıqlaw kodı elektron pochtanızǵa jiberilmekte. Iltimas, kútiń.
                  </p>
                </div>
              ) : (
                <>
                  <div className="modal-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="modal-title">Email 2FA-ni qosıw</h3>
                  <p className="modal-desc">
                    Elektron pochtańızǵa jiberilgen 6 tańbalı tastıyıqlaw kodın kirgiziń.
                  </p>
                  <input
                    type="text"
                    maxLength="6"
                    inputMode="numeric"
                    className="modal-input"
                    placeholder="000000"
                    onChange={(e) => setEmailToken(e.target.value)}
                  />
                  <div className="modal-actions">
                    <button
                      className="modal-cancel"
                      onClick={() => setShowEmailSetupModal(false)}
                    >
                      Biykar qılıw
                    </button>
                    <button className="modal-confirm" style={{ background: "#16a34a", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)" }} onClick={handleEnableEmailMFA}>
                      Qosıw
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Email MFA Disable Modal */}
        {showEmailDisableModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-icon">
                <ShieldOff size={28} />
              </div>
              <h3 className="modal-title">Tastıyıqlaw kerek</h3>
              <p className="modal-desc">
                Email 2FA ni óshiriwdi qáleysiz be?
              </p>
              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() => setShowEmailDisableModal(false)}
                >
                  Biykar qılıw
                </button>
                <button className="modal-confirm" onClick={handleDisableEmailMFA}>
                  Óshiriw
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
