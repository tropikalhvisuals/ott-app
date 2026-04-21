import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  History,
  X,
  LogOut,
} from "lucide-react";

const settingsGroups = [
  {
    title: "Preferences",
    icon: <Settings size={15} color="#e50914" />,
    items: [
      { label: "Autoplay Next Episode", type: "toggle", key: "autoplay" },
      { label: "Auto-Download", type: "toggle", key: "download" },
      { label: "Offline Viewing", type: "toggle", key: "offline" },
      { label: "4K Streaming", type: "toggle", key: "stream4k" },
      { label: "Dolby Atmos", type: "toggle", key: "dolby" },
    ],
  },
  {
    title: "Subscription",
    icon: <CreditCard size={15} color="#38bdf8" />,
    items: [
      { label: "Plan", type: "text", value: "Premium 4K" },
      { label: "Next Billing", type: "text", value: "May 13, 2026" },
      { label: "Amount", type: "text", value: "₹649 / month" },
      { label: "Screens", type: "text", value: "4 simultaneous" },
      { label: "Downloads", type: "text", value: "Unlimited" },
    ],
  },
  {
    title: "Notifications",
    icon: <Bell size={15} color="#f5c518" />,
    items: [
      { label: "New Releases", type: "toggle", key: "newReleases" },
      { label: "Recommendations", type: "toggle", key: "recommendations" },
      { label: "Downloads Complete", type: "toggle", key: "downloadsComplete" },
      { label: "Series Updates", type: "toggle", key: "seriesUpdates" },
      { label: "Offers & Deals", type: "toggle", key: "offers" },
    ],
  },
  {
    title: "Parental Controls",
    icon: <Shield size={15} color="#4ade80" />,
    items: [
      { label: "PIN Protection", type: "toggle", key: "pinProtection" },
      { label: "Content Rating", type: "text", value: "UA 16+" },
      { label: "Time Limit", type: "text", value: "2h / day" },
      { label: "Restrict Genre", type: "text", value: "Horror" },
      { label: "Kids Mode", type: "toggle", key: "kidsMode" },
    ],
  },
];

const initialSettings = {
  autoplay: true,
  download: false,
  offline: true,
  stream4k: true,
  dolby: true,
  newReleases: true,
  recommendations: true,
  downloadsComplete: true,
  seriesUpdates: false,
  offers: false,
  pinProtection: true,
  kidsMode: false,
};

const initialWatchHistory = [
  {
    title: "The Void Chronicles",
    sub: "S2 E5",
    date: "Today, 9:30 PM",
    image: "https://image.tmdb.org/t/p/w300/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
  },
  {
    title: "Blood & Crown",
    sub: "S3 E7",
    date: "Yesterday, 8:15 PM",
    image: "https://image.tmdb.org/t/p/w300/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
  },
  {
    title: "Neon Dystopia",
    sub: "Full Movie",
    date: "Apr 11, 2026",
    image: "https://image.tmdb.org/t/p/w300/voHUmluYmKyleFkTu3lOXQG702u.jpg",
  },
  {
    title: "Dark Matters",
    sub: "S1 E3",
    date: "Apr 10, 2026",
    image: "https://image.tmdb.org/t/p/w300/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
  },
  {
    title: "Crimson Tides",
    sub: "Full Movie",
    date: "Apr 9, 2026",
    image: "https://image.tmdb.org/t/p/w300/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  },
];

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42,
        height: 22,
        background: value ? "var(--red)" : "rgba(255,255,255,0.15)",
        borderRadius: 11,
        position: "relative",
        cursor: "pointer",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: 3,
          width: 16,
          height: 16,
          background: "#fff",
          borderRadius: "50%",
          transition: "transform .2s",
          transform: value ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </div>
  );
}

export default function Profile() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const defaultProfile = {
    name: savedUser?.name || "Guest User",
    email: savedUser?.email || "guest@gmail.com",
    phone: savedUser?.phone || "",
    joined: "Member since Jan 2022",
    plan: "⭐ PREMIUM MEMBER",
    avatar:
      savedUser?.avatar ||
      "https://i.pravatar.cc/150?img=12",
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [formData, setFormData] = useState(defaultProfile);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [watchHistory, setWatchHistory] = useState(initialWatchHistory);

  const openEditModal = () => {
    setFormData(profile);
    setShowModal(true);
  };

  const closeEditModal = () => {
    setShowModal(false);
  };

  const saveProfile = () => {
    const updatedProfile = { ...formData };
    setProfile(updatedProfile);

    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...existingUser,
      name: updatedProfile.name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      avatar: updatedProfile.avatar,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShowModal(false);
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeHistory = (index) => {
    setWatchHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="page-wrap">
      <div className="profile-shell">
        <div className="hero-card">
          <div className="hero-glow" />

          <img src={profile.avatar} alt={profile.name} className="avatar" />

          <div className="hero-content">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-sub">
              {profile.email}
              {profile.phone ? ` · ${profile.phone}` : ""}
              {" · "}
              {profile.joined}
            </p>

            <div className="premium-badge">{profile.plan}</div>
          </div>

          <div className="hero-actions">
            <button className="btn-secondary" onClick={openEditModal}>
              Edit Profile
            </button>
            <button className="btn-primary">Manage Plan</button>
            <button className="btn-secondary logout-btn" onClick={logout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        <div className="settings-grid-wrap">
          {settingsGroups.map((group) => (
            <div key={group.title} className="settings-card">
              <h3 className="card-title">
                {group.icon} {group.title}
              </h3>

              {group.items.map((item, index) => (
                <div
                  key={item.label}
                  className={`setting-row ${
                    index === group.items.length - 1 ? "last" : ""
                  }`}
                >
                  <span className="setting-label">{item.label}</span>

                  {item.type === "toggle" ? (
                    <Toggle
                      value={settings[item.key]}
                      onChange={(val) => updateSetting(item.key, val)}
                    />
                  ) : (
                    <span className="setting-value">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="history-card">
          <h3 className="card-title">
            <History size={15} color="#a78bfa" /> Watch History
          </h3>

          {watchHistory.length === 0 ? (
            <div className="empty-state">No watch history available.</div>
          ) : (
            watchHistory.map((item, index) => (
              <div
                key={`${item.title}-${item.date}`}
                className={`history-row ${
                  index === watchHistory.length - 1 ? "last" : ""
                }`}
              >
                <img src={item.image} alt={item.title} className="history-thumb" />

                <div className="history-info">
                  <div className="history-title">{item.title}</div>
                  <div className="history-sub">
                    {item.sub} · {item.date}
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeHistory(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Profile</h3>
              <button className="icon-btn" onClick={closeEditModal}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label>Profile Image URL</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, avatar: e.target.value }))
                }
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --red: #e50914;
          --red2: #ff4757;
          --card: rgba(17, 20, 28, 0.95);
          --border: rgba(255,255,255,0.08);
          --muted: #9ca3af;
          --gold: #f5c518;
        }

        * {
          box-sizing: border-box;
        }

        .page-wrap {
          padding: 20px 0 34px;
          color: #fff;
        }

        .profile-shell {
          width: 100%;
         
          margin: 0 auto;
          padding: 0 18px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero-card {
          background: var(--card);
          border-radius: 22px;
          padding: 28px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 22px;
          position: relative;
          overflow: hidden;
        }

        .hero-glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 320px;
          height: 100%;
          background: radial-gradient(circle at right, rgba(229,9,20,0.10) 0%, transparent 72%);
          pointer-events: none;
        }

        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 22px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          position: relative;
          z-index: 1;
        }

        .hero-content {
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        .profile-name {
          font-size: 34px;
          line-height: 1;
          letter-spacing: 1px;
          margin: 0 0 8px;
          font-family: 'Bebas Neue', sans-serif;
        }

        .profile-sub {
          color: var(--muted);
          font-size: 14px;
          margin: 0;
        }

        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245,197,24,0.10);
          border: 1px solid rgba(245,197,24,0.30);
          color: var(--gold);
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          margin-top: 12px;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .btn-primary,
        .btn-secondary,
        .remove-btn,
        .icon-btn {
          font-family: inherit;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--red), var(--red2));
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
        }

        .logout-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .settings-grid-wrap {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .settings-card,
        .history-card {
          background: var(--card);
          border-radius: 18px;
          padding: 22px;
          border: 1px solid var(--border);
        }

        .card-title {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .setting-row.last {
          border-bottom: none;
          padding-bottom: 0;
        }

        .setting-label {
          font-size: 13px;
          color: var(--muted);
        }

        .setting-value {
          font-size: 13px;
          color: #fff;
          font-weight: 600;
          text-align: right;
        }

        .history-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .history-row.last {
          border-bottom: none;
          padding-bottom: 0;
        }

        .history-thumb {
          width: 72px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
          background: #111827;
        }

        .history-info {
          flex: 1;
          min-width: 0;
        }

        .history-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 3px;
        }

        .history-sub {
          font-size: 11px;
          color: var(--muted);
        }

        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .remove-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .empty-state {
          color: var(--muted);
          font-size: 13px;
          padding: 10px 0 4px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 999;
        }

        .modal-box {
          width: 100%;
          max-width: 420px;
          background: #11151f;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }

        .modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .modal-head h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 11px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          border-radius: 10px;
          outline: none;
        }

        .form-group input:focus {
          border-color: rgba(229,9,20,0.6);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .hero-card {
            flex-wrap: wrap;
            align-items: flex-start;
          }

          .hero-actions {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
          }

          .settings-grid-wrap {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .profile-shell {
            padding: 0 14px;
          }

          .hero-card {
            padding: 20px;
            gap: 16px;
          }

          .avatar {
            width: 78px;
            height: 78px;
          }

          .profile-name {
            font-size: 28px;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .modal-box {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}