export const STATUS_COLOR = {
  Active: "#10b981",
  Blocked: "#ef4444",
  Draft: "#f59e0b",
  Published: "#10b981",
};

export const S = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(229,9,20,0.08), transparent 22%), #05070d",
    color: "#fff",
    display: "flex",
    overflow: "hidden",
  },

  sidebar: {
    width: 250,
    height: "100vh",
    position: "sticky", // use "fixed" if you want it always locked
    top: 0,
    left: 0,
    background: "linear-gradient(180deg, #120307 0%, #09090f 100%)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    flexShrink: 0,
    overflowY: "auto",
  },

  sidebarTop: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  logoWrap: {
    paddingBottom: 12,
    marginBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  logo: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.18em",
    color: "#fff",
    lineHeight: 1.1,
  },

  logoSub: {
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 4,
  },

  navItem: (active = false) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 14,
    border: active
      ? "1px solid rgba(229,9,20,0.35)"
      : "1px solid rgba(255,255,255,0.04)",
    background: active
      ? "rgba(229,9,20,0.14)"
      : "rgba(255,255,255,0.02)",
    color: active ? "#fff" : "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    transition: "all 0.2s ease",
    textAlign: "left",
    outline: "none",
  }),

  adminCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: "12px 14px",
    marginTop: 16,
    flexShrink: 0,
  },

  adminAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff3b3b, #e50914)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(229,9,20,0.28)",
  },

  content: {
    flex: 1,
    minHeight: "100vh",
    padding: 24,
    overflowY: "auto",
    boxSizing: "border-box",
  },

  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
  },

  cardDark: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
  },

  btnGhost: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.03)",
    color: "#d9d9d9",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  badge: (color) => ({
    padding: "6px 10px",
    borderRadius: 999,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    color,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  }),
};