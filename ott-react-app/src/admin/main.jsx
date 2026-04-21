import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Film,
  Tv,
  Upload,
  Settings,
  Search,
  Bell,
  Tags,
  CreditCard,
  X,
  PanelLeft,
  Headset,
} from "lucide-react";

import Dashboard from "./Dashboard";
import UsersPage from "./UsersPage";
import MoviesPage from "./MoviesPage";
import SeriesPage from "./SeriesPage";
import UploadPage from "./UploadPage";
import GenresPage from "./GenresPage";
import PlansPage from "./PlansPage";
import SettingsPage from "./SettingsPage";
import AdminCustomerCarePage from "./AdminCustomerCarePage";

const initialUsers = [
  {
    id: 1,
    name: "Tamil King",
    email: "tamil@gmail.com",
    role: "User",
    status: "Active",
    joined: "2026-04-13",
  },
  {
    id: 2,
    name: "Arun",
    email: "arun@gmail.com",
    role: "User",
    status: "Active",
    joined: "2026-04-10",
  },
  {
    id: 3,
    name: "Priya",
    email: "priya@gmail.com",
    role: "Premium",
    status: "Blocked",
    joined: "2026-04-08",
  },
];

const initialMovies = [
  {
    id: 1,
    title: "Neon Dystopia",
    genre: "Sci-Fi",
    year: 2024,
    status: "Published",
    rating: 9.1,
  },
  {
    id: 2,
    title: "Crimson Tides",
    genre: "Action",
    year: 2023,
    status: "Draft",
    rating: 8.3,
  },
];

const initialSeries = [
  {
    id: 1,
    title: "Breaking Bad",
    genre: "Drama",
    seasons: 5,
    status: "Published",
    rating: 9.5,
  },
  {
    id: 2,
    title: "Stranger Things",
    genre: "Sci-Fi & Fantasy",
    seasons: 4,
    status: "Published",
    rating: 8.9,
  },
];

const initialGenres = [
  "Action",
  "Drama",
  "Sci-Fi",
  "Comedy",
  "Thriller",
  "Romance",
];

const initialPlans = [
  {
    id: 1,
    name: "Basic",
    price: "₹199",
    features: ["720p HD Streaming", "1 Screen at a time", "Mobile & Tablet"],
  },
  {
    id: 2,
    name: "Premium 4K",
    price: "₹649",
    features: [
      "4K Ultra HD",
      "4 Screens at once",
      "All devices",
      "Offline downloads",
      "All content",
    ],
  },
];

const NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    desc: "Complete overview of content, users, revenue, and platform activity.",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    desc: "Manage registered users, account access, and subscription activity.",
  },
  {
    key: "movies",
    label: "Movies",
    icon: Film,
    desc: "Track all movies, publishing status, ratings, and metadata.",
  },
  {
    key: "series",
    label: "Series",
    icon: Tv,
    desc: "Manage series, seasons, episode publishing, and content quality.",
  },
  {
    key: "upload",
    label: "Upload Content",
    icon: Upload,
    desc: "Upload banners, posters, trailers, and full video content.",
  },
  {
    key: "genres",
    label: "Genres",
    icon: Tags,
    desc: "Control genre categories used across movies and series.",
  },
  {
    key: "plans",
    label: "Plans",
    icon: CreditCard,
    desc: "Create, update, and manage subscription pricing plans.",
  },
  {
    key: "customer-care",
    label: "Customer Care",
    icon: Headset,
    desc: "View customer queries, support tickets, and live chat conversations.",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    desc: "Update admin preferences, branding, and platform configuration.",
  },
];

export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [users, setUsers] = useState(initialUsers);
  const [movies, setMovies] = useState(initialMovies);
  const [series, setSeries] = useState(initialSeries);
  const [genres, setGenres] = useState(initialGenres);
  const [plans, setPlans] = useState(initialPlans);
  const [query, setQuery] = useState("");
  const [pendingModal, setPendingModal] = useState(null);

  const currentNav = useMemo(() => {
    return NAV.find((item) => item.key === page) || NAV[0];
  }, [page]);

  const navigate = (nextPage) => {
    setPage(nextPage);
    setQuery("");
  };

  const handleOpenModal = (type) => {
    const map = {
      movie: "movies",
      series: "series",
      genre: "genres",
      plan: "plans",
    };
    navigate(map[type] || type);
    setPendingModal(type);
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      display: "flex",
      background:
        "radial-gradient(circle at top left, rgba(229,9,20,0.12) 0%, transparent 22%), radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 18%), linear-gradient(180deg, #05070d 0%, #090b12 45%, #06080e 100%)",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      overflow: "hidden",
    },

    sidebar: {
      width: 250,
      height: "100vh",
      position: "sticky",
      top: 0,
      left: 0,
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "linear-gradient(180deg, #0d0d12 0%, #08090d 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      boxSizing: "border-box",
      flexShrink: 0,
      overflowY: "auto",
    },

    sidebarTop: {
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    },

    brandWrap: {
      marginBottom: 22,
      padding: "6px 6px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },

    brandTop: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },

    logoIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "linear-gradient(135deg, #ff3b3b 0%, #e50914 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 10px 24px rgba(229,9,20,0.30)",
      flexShrink: 0,
    },

    brandTitle: {
      fontSize: 28,
      fontWeight: 900,
      letterSpacing: "0.14em",
      margin: 0,
      lineHeight: 1,
      color: "#fff",
    },

    brandSub: {
      fontSize: 11,
      color: "rgba(255,255,255,0.42)",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      marginTop: 6,
    },

    navWrap: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginTop: 18,
    },

    navButton: (active) => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 14px",
      borderRadius: 16,
      border: active
        ? "1px solid rgba(229,9,20,0.38)"
        : "1px solid rgba(255,255,255,0.04)",
      background: active
        ? "linear-gradient(90deg, rgba(229,9,20,0.16), rgba(229,9,20,0.05))"
        : "rgba(255,255,255,0.02)",
      color: active ? "#fff" : "rgba(255,255,255,0.75)",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 700 : 500,
      textAlign: "left",
      transition: "all 0.25s ease",
      outline: "none",
      boxShadow: active ? "0 8px 24px rgba(229,9,20,0.12)" : "none",
    }),

    adminCard: {
      marginTop: 20,
      padding: 14,
      borderRadius: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
      border: "1px solid rgba(255,255,255,0.07)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexShrink: 0,
    },

    avatar: {
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #ff3d3d, #e50914)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 15,
      color: "#fff",
      boxShadow: "0 10px 24px rgba(229,9,20,0.28)",
      flexShrink: 0,
    },

    adminName: {
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },

    adminEmail: {
      fontSize: 12,
      color: "rgba(255,255,255,0.45)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    content: {
      flex: 1,
      minWidth: 0,
      height: "100vh",
      overflowY: "auto",
      padding: 28,
      boxSizing: "border-box",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      marginBottom: 26,
      flexWrap: "wrap",
    },

    titleBlock: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },

    pageLabel: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      width: "fit-content",
      padding: "7px 12px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.72)",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
    },

    title: {
      margin: 0,
      fontSize: 34,
      lineHeight: 1.05,
      fontWeight: 900,
      letterSpacing: "-0.03em",
      color: "#fff",
    },

    subtitle: {
      margin: 0,
      maxWidth: 760,
      fontSize: 14,
      lineHeight: 1.7,
      color: "rgba(255,255,255,0.52)",
    },

    topActions: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginLeft: "auto",
    },

    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 310,
      height: 50,
      borderRadius: 16,
      padding: "0 14px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    },

    searchInput: {
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      color: "#fff",
      fontSize: 14,
    },

    iconButton: {
      width: 50,
      height: 50,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    contentCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      padding: 20,
      boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
      overflow: "hidden",
    },
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.brandWrap}>
            <div style={styles.brandTop}>
              <div style={styles.logoIcon}>
                <PanelLeft size={20} color="#fff" />
              </div>
              <div>
                <h2 style={styles.brandTitle}>HFLIX</h2>
                <div style={styles.brandSub}>Admin Panel</div>
              </div>
            </div>
          </div>

          <nav style={styles.navWrap}>
            {NAV.map(({ key, label, icon: Icon }) => {
              const active = page === key;

              return (
                <button
                  key={key}
                  onClick={() => navigate(key)}
                  style={styles.navButton(active)}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                    }
                  }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div style={styles.adminCard}>
          <div style={styles.avatar}>A</div>
          <div style={{ minWidth: 0 }}>
            <div style={styles.adminName}>Admin User</div>
            <div style={styles.adminEmail}>admin@hflix.com</div>
          </div>
        </div>
      </aside>

      <main style={styles.content}>
        <div style={styles.topBar}>
          <div style={styles.titleBlock}>
            <div style={styles.pageLabel}>
              <currentNav.icon size={14} />
              <span>{currentNav.label}</span>
            </div>

            <h1 style={styles.title}>{currentNav.label}</h1>
            <p style={styles.subtitle}>{currentNav.desc}</p>
          </div>

          <div style={styles.topActions}>
            <div style={styles.searchWrap}>
              <Search size={16} color="rgba(255,255,255,0.45)" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${currentNav.label.toLowerCase()}...`}
                style={styles.searchInput}
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.45)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <button style={styles.iconButton}>
              <Bell size={18} />
            </button>
          </div>
        </div>

        <div style={styles.contentCard}>
          {page === "dashboard" && (
            <Dashboard
              users={users}
              movies={movies}
              series={series}
              plans={plans}
              onNavigate={navigate}
              onOpenModal={handleOpenModal}
            />
          )}

          {page === "users" && (
            <UsersPage users={users} setUsers={setUsers} query={query} />
          )}

          {page === "movies" && (
            <MoviesPage
              movies={movies}
              setMovies={setMovies}
              query={query}
              externalModal={pendingModal === "movie" ? "movie" : null}
              onCloseModal={() => setPendingModal(null)}
            />
          )}

          {page === "series" && (
            <SeriesPage
              series={series}
              setSeries={setSeries}
              query={query}
              externalModal={pendingModal === "series" ? "series" : null}
              onCloseModal={() => setPendingModal(null)}
            />
          )}

          {page === "upload" && <UploadPage genres={genres} />}

          {page === "genres" && (
            <GenresPage genres={genres} setGenres={setGenres} />
          )}

          {page === "plans" && (
            <PlansPage plans={plans} setPlans={setPlans} />
          )}

          {page === "customer-care" && <AdminCustomerCarePage />}

          {page === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}