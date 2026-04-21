import {
  Users,
  Film,
  Tv,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const STATUS_COLOR = {
  Active: "#10b981",
  Blocked: "#ef4444",
  Draft: "#f59e0b",
  Published: "#10b981",
};

export default function Dashboard({
  users = [],
  movies = [],
  series = [],
  plans = [],
  onNavigate,
  onOpenModal,
}) {
  const publishedMovies = movies.filter((item) => item.status === "Published").length;
  const draftMovies = movies.filter((item) => item.status === "Draft").length;
  const publishedSeries = series.filter((item) => item.status === "Published").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      meta: "+ 12 this week",
    },
    {
      title: "Movies",
      value: movies.length,
      icon: Film,
      meta: `${publishedMovies} published`,
    },
    {
      title: "Series",
      value: series.length,
      icon: Tv,
      meta: `${publishedSeries} active shows`,
    },
    {
      title: "Plans",
      value: plans.length,
      icon: CreditCard,
      meta: "Premium enabled",
    },
  ];

  const latestMovies = movies.slice(0, 3);
  const activePlans = plans.slice(0, 2);

  const styles = {
    wrap: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 16,
    },

    statCard: {
      borderRadius: 20,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
    },

    statTop: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    },

    statTitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.55)",
      fontWeight: 600,
      marginBottom: 8,
    },

    statValue: {
      fontSize: 34,
      fontWeight: 900,
      lineHeight: 1,
      color: "#fff",
    },

    statMeta: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "#14f1c2",
      fontWeight: 700,
      fontSize: 13,
    },

    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.35)",
      color: "#ff2d2d",
      flexShrink: 0,
    },

    middleGrid: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 16,
    },

    panel: {
      borderRadius: 22,
      padding: 16,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      minHeight: 220,
    },

    panelTitle: {
      margin: 0,
      marginBottom: 14,
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
    },

    userList: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    userRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      padding: "14px 14px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
    },

    userLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },

    avatar: (char) => ({
      width: 38,
      height: 38,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(229,9,20,0.14)",
      border: "1px solid rgba(229,9,20,0.34)",
      color: "#ff5c5c",
      fontWeight: 800,
      flexShrink: 0,
    }),

    userName: {
      fontSize: 15,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },

    userEmail: {
      fontSize: 13,
      color: "rgba(255,255,255,0.42)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    badge: (color) => ({
      padding: "7px 12px",
      borderRadius: 999,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      color,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }),

    footerLink: {
      marginTop: 12,
      width: "100%",
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      color: "#fff",
      borderRadius: 14,
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer",
      fontWeight: 700,
    },

    actionList: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 18,
    },

    actionButton: {
      width: "100%",
      padding: "14px 14px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: "#fff",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      textAlign: "left",
    },

    plusIcon: {
      width: 26,
      height: 26,
      borderRadius: 10,
      background: "rgba(229,9,20,0.14)",
      border: "1px solid rgba(229,9,20,0.34)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff2d2d",
      flexShrink: 0,
    },

    sectionLabel: {
      fontSize: 12,
      fontWeight: 800,
      color: "rgba(255,255,255,0.42)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      marginBottom: 14,
    },

    progressBlock: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },

    progressRow: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },

    progressHead: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      fontSize: 13,
      fontWeight: 700,
      color: "rgba(255,255,255,0.72)",
    },

    progressBarTrack: {
      height: 8,
      width: "100%",
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },

    progressBarFill: (width) => ({
      height: "100%",
      width,
      borderRadius: 999,
      background: "linear-gradient(90deg, #ff2d2d, #ff3d3d)",
    }),

    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 16,
    },

    movieCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      padding: "14px 14px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 12,
    },

    movieInfo: {
      minWidth: 0,
    },

    movieTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },

    movieSub: {
      fontSize: 13,
      color: "rgba(255,255,255,0.42)",
    },

    rating: {
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      padding: "8px 10px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap",
    },

    planCard: {
      padding: 16,
      borderRadius: 18,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 12,
    },

    planTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      gap: 12,
    },

    planName: {
      fontSize: 16,
      fontWeight: 800,
      color: "#fff",
    },

    planPrice: {
      fontSize: 15,
      fontWeight: 800,
      color: "#ff4b4b",
    },

    featureList: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 8,
    },

    featureItem: {
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
    },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.statsGrid}>
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} style={styles.statCard}>
              <div style={styles.statTop}>
                <div>
                  <div style={styles.statTitle}>{item.title}</div>
                  <div style={styles.statValue}>{item.value}</div>
                </div>
                <div style={styles.statIcon}>
                  <Icon size={18} />
                </div>
              </div>

              <div style={styles.statMeta}>
                <TrendingUp size={14} />
                <span>{item.meta}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.middleGrid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Recent Users</h3>

          <div style={styles.userList}>
            {users.map((user) => (
              <div key={user.id} style={styles.userRow}>
                <div style={styles.userLeft}>
                  <div style={styles.avatar()}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                </div>

                <div style={styles.badge(STATUS_COLOR[user.status] || "#999")}>
                  {user.status}
                </div>
              </div>
            ))}
          </div>

          <button style={styles.footerLink} onClick={() => onNavigate("users")}>
            <span>View all users</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Quick Actions</h3>

          <div style={styles.actionList}>
            <button style={styles.actionButton} onClick={() => onOpenModal("movie")}>
              <div style={styles.plusIcon}>
                <Plus size={14} />
              </div>
              <span>Add Movie</span>
            </button>

            <button style={styles.actionButton} onClick={() => onOpenModal("series")}>
              <div style={styles.plusIcon}>
                <Plus size={14} />
              </div>
              <span>Add Series</span>
            </button>

            <button style={styles.actionButton} onClick={() => onOpenModal("genre")}>
              <div style={styles.plusIcon}>
                <Plus size={14} />
              </div>
              <span>Add Genre</span>
            </button>

            <button style={styles.actionButton} onClick={() => onOpenModal("plan")}>
              <div style={styles.plusIcon}>
                <Plus size={14} />
              </div>
              <span>Add Plan</span>
            </button>
          </div>

          <div style={styles.sectionLabel}>Content Overview</div>

          <div style={styles.progressBlock}>
            <div style={styles.progressRow}>
              <div style={styles.progressHead}>
                <span>Published Movies</span>
                <span>{publishedMovies}/{movies.length}</span>
              </div>
              <div style={styles.progressBarTrack}>
                <div
                  style={styles.progressBarFill(
                    movies.length ? `${(publishedMovies / movies.length) * 100}%` : "0%"
                  )}
                />
              </div>
            </div>

            <div style={styles.progressRow}>
              <div style={styles.progressHead}>
                <span>Draft Movies</span>
                <span>{draftMovies}/{movies.length}</span>
              </div>
              <div style={styles.progressBarTrack}>
                <div
                  style={styles.progressBarFill(
                    movies.length ? `${(draftMovies / movies.length) * 100}%` : "0%"
                  )}
                />
              </div>
            </div>

            <div style={styles.progressRow}>
              <div style={styles.progressHead}>
                <span>Published Series</span>
                <span>{publishedSeries}/{series.length}</span>
              </div>
              <div style={styles.progressBarTrack}>
                <div
                  style={styles.progressBarFill(
                    series.length ? `${(publishedSeries / series.length) * 100}%` : "0%"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Latest Movies</h3>

          {latestMovies.map((movie) => (
            <div key={movie.id} style={styles.movieCard}>
              <div style={styles.movieInfo}>
                <div style={styles.movieTitle}>{movie.title}</div>
                <div style={styles.movieSub}>
                  {movie.genre} • {movie.year} • {movie.status}
                </div>
              </div>

              <div style={styles.rating}>⭐ {movie.rating}</div>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Active Plans</h3>

          {activePlans.map((plan) => (
            <div key={plan.id} style={styles.planCard}>
              <div style={styles.planTop}>
                <div style={styles.planName}>{plan.name}</div>
                <div style={styles.planPrice}>{plan.price}</div>
              </div>

              <div style={styles.featureList}>
                {plan.features.map((feature, index) => (
                  <div key={index} style={styles.featureItem}>
                    • {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}