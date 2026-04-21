import { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  Bell,
  Globe,
  Trash2,
  Upload,
  Download,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [platform, setPlatform] = useState({
    name: "HFLIX",
    email: "support@hflix.com",
    currency: "INR",
  });

  const [security, setSecurity] = useState({
    adminEmail: "admin@hflix.com",
    password: "",
    confirm: "",
  });

  const [toggles, setToggles] = useState({
    registration: true,
    maintenance: false,
    emailNotifications: true,
    analytics: true,
  });

  /* =========================
     🔥 CORE FUNCTIONS
  ========================= */

  // AUTO SAVE
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 800);
    return () => clearTimeout(timer);
  }, [platform, security, toggles]);

  // VALIDATION
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = () =>
    security.password &&
    security.password === security.confirm;

  // RESET
  const handleReset = () => {
    if (!window.confirm("Reset all settings?")) return;
    setPlatform({ name: "", email: "", currency: "INR" });
    setSecurity({ adminEmail: "", password: "", confirm: "" });
    setToggles({
      registration: false,
      maintenance: false,
      emailNotifications: false,
      analytics: false,
    });
  };

  // EXPORT
  const exportSettings = () => {
    const data = { platform, security, toggles };
    const blob = new Blob([JSON.stringify(data, null, 2)]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "settings.json";
    a.click();
  };

  // IMPORT
  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      setPlatform(data.platform || {});
      setSecurity(data.security || {});
      setToggles(data.toggles || {});
    };
    reader.readAsText(file);
  };

  // CLEAR CACHE
  const clearCache = () => {
    alert("Cache cleared successfully 🚀");
  };

  const toggle = (k) =>
    setToggles((p) => ({ ...p, [k]: !p[k] }));

  /* =========================
     🎨 UI
  ========================= */

  const styles = {
    page: { display: "flex", flexDirection: "column", gap: 20 },

    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },

    card: {
      padding: 20,
      borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },

    input: {
      padding: 12,
      borderRadius: 12,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
    },

    toggle: (v) => ({
      width: 48,
      height: 26,
      borderRadius: 20,
      background: v ? "#e50914" : "#555",
      position: "relative",
      cursor: "pointer",
    }),

    dot: (v) => ({
      position: "absolute",
      top: 4,
      left: v ? 24 : 4,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "#fff",
      transition: "0.2s",
    }),

    saveBar: {
      position: "fixed",
      bottom: 20,
      right: 20,
      background: saved ? "#10b981" : "#222",
      padding: "12px 18px",
      borderRadius: 14,
      color: "#fff",
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
  };

  return (
    <div style={styles.page}>

      <div style={styles.grid}>

        {/* PLATFORM */}
        <div style={styles.card}>
          <h3><Settings size={16}/> Platform</h3>

          <input style={styles.input}
            value={platform.name}
            onChange={e => setPlatform(p => ({ ...p, name: e.target.value }))}
            placeholder="Platform Name"
          />

          <input style={styles.input}
            value={platform.email}
            onChange={e => setPlatform(p => ({ ...p, email: e.target.value }))}
            placeholder="Support Email"
          />

          {!validateEmail(platform.email) && (
            <small style={{ color: "#f87171" }}>Invalid email</small>
          )}
        </div>

        {/* SECURITY */}
        <div style={styles.card}>
          <h3><Shield size={16}/> Security</h3>

          <input style={styles.input}
            value={security.adminEmail}
            onChange={e => setSecurity(p => ({ ...p, adminEmail: e.target.value }))}
          />

          <input style={styles.input} type="password"
            placeholder="New Password"
            onChange={e => setSecurity(p => ({ ...p, password: e.target.value }))}
          />

          <input style={styles.input} type="password"
            placeholder="Confirm Password"
            onChange={e => setSecurity(p => ({ ...p, confirm: e.target.value }))}
          />

          {!validatePassword() && security.confirm && (
            <small style={{ color: "#f87171" }}>Passwords do not match</small>
          )}
        </div>

        {/* TOGGLES */}
        <div style={styles.card}>
          <h3><Bell size={16}/> Controls</h3>

          {Object.keys(toggles).map(key => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{key}</span>
              <div style={styles.toggle(toggles[key])} onClick={() => toggle(key)}>
                <div style={styles.dot(toggles[key])}/>
              </div>
            </div>
          ))}
        </div>

        {/* ADVANCED */}
        <div style={styles.card}>
          <h3><Globe size={16}/> Advanced</h3>

          <button onClick={exportSettings}>
            <Download size={14}/> Export
          </button>

          <input type="file" onChange={importSettings} />

          <button onClick={clearCache}>
            <Trash2 size={14}/> Clear Cache
          </button>

          <button onClick={handleReset}>
            Reset All Settings
          </button>
        </div>

      </div>

      {/* AUTO SAVE BAR */}
      <div style={styles.saveBar}>
        {saved ? <CheckCircle size={14}/> : <Save size={14}/>}
        {saved ? "Saved" : "Saving..."}
      </div>
    </div>
  );
}