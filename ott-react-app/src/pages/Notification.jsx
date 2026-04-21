import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  Clock3,
  CheckCheck,
  Film,
  PlayCircle,
  Tv,
  Trash2,
  RefreshCw,
  Check,
  EyeOff,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const TYPE_META = {
  movie: {
    label: "Movie",
    color: "#3b82f6",
    icon: <Film size={18} />,
  },
  trailer: {
    label: "Trailer",
    color: "#ef4444",
    icon: <PlayCircle size={18} />,
  },
  series: {
    label: "Series",
    color: "#8b5cf6",
    icon: <Tv size={18} />,
  },
  system: {
    label: "System",
    color: "#10b981",
    icon: <Bell size={18} />,
  },
};

function formatTimeLabel(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

function buildNotificationsFromMovies(items) {
  if (!Array.isArray(items)) return [];

  const sorted = [...items].sort((a, b) => {
    const da = new Date(a.created_at || a.updated_at || 0).getTime();
    const db = new Date(b.created_at || b.updated_at || 0).getTime();
    return db - da;
  });

  return sorted.map((item, index) => {
    const typeKey = String(item.type || "system").toLowerCase();
    const meta = TYPE_META[typeKey] || TYPE_META.system;
    const isPublished = String(item.status || "").toLowerCase() === "published";

    return {
      id: item.id || index + 1,
      sourceId: item.id || null,
      type: typeKey,
      title: item.title || "Untitled Content",
      message: isPublished
        ? `${meta.label} content "${item.title || "Untitled"}" is published and available in the library.`
        : `${meta.label} content "${item.title || "Untitled"}" was updated and is currently in draft state.`,
      time: formatTimeLabel(item.created_at || item.updated_at),
      createdAt: item.created_at || item.updated_at || null,
      read: index > 1,
      hidden: false,
      status: isPublished ? "Published" : "Draft",
      language: item.language || "English",
      quality: item.quality || "HD",
      genre: item.genre || "Unknown",
      color: meta.color,
      icon: meta.icon,
    };
  });
}

export default function Notification() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [notifications, setNotifications] = useState([]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/movies`);
      const data = await res.json();

      if (res.ok && data?.success && Array.isArray(data.movies)) {
        setMovies(data.movies);
        setNotifications(buildNotificationsFromMovies(data.movies));
      } else {
        setMovies([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
      setMovies([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => !item.hidden);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return visibleNotifications.filter((item) => {
      const haystack = `
        ${item.title}
        ${item.message}
        ${item.type}
        ${item.status}
        ${item.genre}
        ${item.language}
        ${item.quality}
      `.toLowerCase();

      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesRead =
        filterRead === "all" ||
        (filterRead === "read" && item.read) ||
        (filterRead === "unread" && !item.read);

      return matchesQuery && matchesType && matchesRead;
    });
  }, [visibleNotifications, query, filterType, filterRead]);

  const unreadCount = visibleNotifications.filter((item) => !item.read).length;
  const totalCount = visibleNotifications.length;
  const publishedCount = movies.filter(
    (item) => String(item.status || "").toLowerCase() === "published"
  ).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: false } : item
      )
    );
  };

  const hideNotification = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, hidden: true } : item
      )
    );
  };

  const clearAllNotifications = () => {
    const ok = window.confirm("Clear all notifications?");
    if (!ok) return;

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        hidden: true,
      }))
    );
  };

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 26,
      padding: 26,
      width: "100%",
    },

    headerCard: {
      borderRadius: 22,
      padding: 26,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
    },

    title: {
      margin: 0,
      color: "#fff",
      fontSize: 28,
      fontWeight: 900,
      lineHeight: 1.1,
    },

    subtitle: {
      marginTop: 10,
      color: "rgba(255,255,255,0.60)",
      fontSize: 14,
      lineHeight: 1.7,
      maxWidth: 760,
    },

    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 14,
      marginTop: 18,
    },

    statCard: {
      borderRadius: 18,
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    },

    statLabel: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 12,
      fontWeight: 700,
    },

    statValue: {
      marginTop: 8,
      color: "#fff",
      fontSize: 28,
      fontWeight: 900,
      lineHeight: 1,
    },

    actionsRow: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 18,
    },

    primaryBtn: {
      height: 44,
      borderRadius: 14,
      border: "1px solid rgba(229,9,20,0.34)",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "0 16px",
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    ghostBtn: {
      height: 44,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "0 16px",
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    toolbar: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
    },

    searchWrap: {
      minWidth: 260,
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 48,
      borderRadius: 16,
      padding: "0 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
    },

    searchInput: {
      width: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      color: "#fff",
      fontSize: 14,
    },

    select: {
      height: 46,
      borderRadius: 14,
      padding: "0 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "#fff",
      fontSize: 14,
      outline: "none",
      minWidth: 140,
    },

    listWrap: {
      borderRadius: 22,
      overflow: "hidden",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
    },

    listHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },

    listTitle: {
      margin: 0,
      color: "#fff",
      fontSize: 18,
      fontWeight: 800,
    },

    listSub: {
      color: "rgba(255,255,255,0.48)",
      fontSize: 13,
      marginTop: 4,
    },

    listBody: {
      display: "flex",
      flexDirection: "column",
    },

    row: {
      display: "grid",
      gridTemplateColumns: "52px minmax(0, 1fr) auto",
      gap: 14,
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },

    unreadRow: {
      background: "rgba(255,255,255,0.02)",
    },

    iconBox: (color) => ({
      width: 44,
      height: 44,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      background: `${color}18`,
      border: `1px solid ${color}4a`,
      flexShrink: 0,
    }),

    contentWrap: {
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },

    topLine: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },

    notifTitle: {
      margin: 0,
      color: "#fff",
      fontSize: 16,
      fontWeight: 800,
    },

    pill: (color) => ({
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      color,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      whiteSpace: "nowrap",
    }),

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "#ef4444",
      boxShadow: "0 0 0 6px rgba(239,68,68,0.10)",
    },

    message: {
      color: "rgba(255,255,255,0.64)",
      fontSize: 14,
      lineHeight: 1.6,
    },

    metaLine: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      color: "rgba(255,255,255,0.46)",
      fontSize: 12,
      fontWeight: 600,
    },

    actionArea: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      justifyContent: "flex-end",
      alignItems: "center",
      minWidth: 210,
    },

    miniBtn: {
      height: 36,
      borderRadius: 12,
      padding: "0 12px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 7,
      whiteSpace: "nowrap",
    },

    empty: {
      padding: 30,
      textAlign: "center",
      color: "rgba(255,255,255,0.54)",
    },

    loading: {
      padding: 30,
      textAlign: "center",
      color: "rgba(255,255,255,0.60)",
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
    },
  };

  if (loading) {
    return <div style={styles.loading}>Loading notifications...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h2 style={styles.title}>Notifications Center</h2>
        <div style={styles.subtitle}>
          View all recent content updates in a clean aligned notification list.
          You can search, filter, mark read, mark unread, refresh, hide single
          notifications, or clear everything.
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Notifications</div>
            <div style={styles.statValue}>{totalCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Unread</div>
            <div style={styles.statValue}>{unreadCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Published Content</div>
            <div style={styles.statValue}>{publishedCount}</div>
          </div>
        </div>

        <div style={styles.actionsRow}>
          <button style={styles.primaryBtn} onClick={markAllAsRead}>
            <CheckCheck size={17} />
            Mark all as read
          </button>

          <button style={styles.ghostBtn} onClick={fetchContent}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button style={styles.ghostBtn} onClick={clearAllNotifications}>
            <X size={16} />
            Clear all
          </button>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} color="rgba(255,255,255,0.45)" />
          <input
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          style={styles.select}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option style={{ background: "#111" }} value="all">
            All Types
          </option>
          <option style={{ background: "#111" }} value="movie">
            Movie
          </option>
          <option style={{ background: "#111" }} value="trailer">
            Trailer
          </option>
          <option style={{ background: "#111" }} value="series">
            Series
          </option>
        </select>

        <select
          style={styles.select}
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
        >
          <option style={{ background: "#111" }} value="all">
            All Status
          </option>
          <option style={{ background: "#111" }} value="unread">
            Unread
          </option>
          <option style={{ background: "#111" }} value="read">
            Read
          </option>
        </select>
      </div>

      <div style={styles.listWrap}>
        <div style={styles.listHeader}>
          <div>
            <h3 style={styles.listTitle}>Recent Notifications</h3>
            <div style={styles.listSub}>
              Clean aligned activity list
            </div>
          </div>
        </div>

        <div style={styles.listBody}>
          {filteredNotifications.length === 0 ? (
            <div style={styles.empty}>No notifications found.</div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.row,
                  ...(item.read ? {} : styles.unreadRow),
                }}
              >
                <div style={styles.iconBox(item.color)}>{item.icon}</div>

                <div style={styles.contentWrap}>
                  <div style={styles.topLine}>
                    <h4 style={styles.notifTitle}>{item.title}</h4>

                    <span style={styles.pill(item.color)}>
                      {TYPE_META[item.type]?.label || "Update"}
                    </span>

                    <span
                      style={styles.pill(
                        item.status === "Published" ? "#10b981" : "#f59e0b"
                      )}
                    >
                      {item.status}
                    </span>

                    {!item.read && <span style={styles.unreadDot} />}
                  </div>

                  <div style={styles.message}>{item.message}</div>

                  <div style={styles.metaLine}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock3 size={13} />
                      {item.time}
                    </span>
                    <span>Genre: {item.genre}</span>
                    <span>Language: {item.language}</span>
                    <span>Quality: {item.quality}</span>
                  </div>
                </div>

                <div style={styles.actionArea}>
                  {!item.read ? (
                    <button
                      style={styles.miniBtn}
                      onClick={() => markAsRead(item.id)}
                    >
                      <Check size={15} />
                      Read
                    </button>
                  ) : (
                    <button
                      style={styles.miniBtn}
                      onClick={() => markAsUnread(item.id)}
                    >
                      <EyeOff size={15} />
                      Unread
                    </button>
                  )}

                  <button
                    style={styles.miniBtn}
                    onClick={() => hideNotification(item.id)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}