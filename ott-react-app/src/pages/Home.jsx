import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Film,
  Tv,
  PlayCircle,
  User,
  LogOut,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Star,
  Heart,
  ChevronRight,
  Play,
  Plus,
  Headset,
} from "lucide-react";

import Movies from "./Movies";
import Series from "./Series";
import Profile from "./Profile";
import Player from "./Player";
import Notification from "./Notification";
import Favorite from "./Favorite";
import CustomerCare from "./CustomerCare";
import "./Home.css";

const API_BASE = "http://localhost:5000";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
      <rect width="800" height="1200" fill="#0f172a"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#94a3b8" font-size="42" font-family="Arial, sans-serif">No Image</text>
    </svg>
  `);

const genreColors = {
  "Sci-Fi": {
    bg: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.3)",
    text: "#38bdf8",
  },
  Action: {
    bg: "rgba(255,107,53,0.12)",
    border: "rgba(255,107,53,0.3)",
    text: "#ff6b35",
  },
  Drama: {
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.3)",
    text: "#a78bfa",
  },
  Horror: {
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.3)",
    text: "#f87171",
  },
  Comedy: {
    bg: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.3)",
    text: "#4ade80",
  },
  Romance: {
    bg: "rgba(249,168,212,0.12)",
    border: "rgba(249,168,212,0.3)",
    text: "#f9a8d4",
  },
  Thriller: {
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.3)",
    text: "#fbbf24",
  },
  Mystery: {
    bg: "rgba(129,140,248,0.12)",
    border: "rgba(129,140,248,0.3)",
    text: "#818cf8",
  },
};

function getPoster(movie) {
  return movie?.thumbnail_url || movie?.image || FALLBACK_IMAGE;
}

function getPlayableUrl(movie) {
  return movie?.hls_master_url || movie?.video_url || movie?.source_video_url || "";
}

function getDisplayRating(movie) {
  if (movie?.rating) return movie.rating;

  const quality = (movie?.quality || "").toLowerCase();
  if (quality.includes("4k")) return "9.0";
  if (quality.includes("1080")) return "8.7";
  if (quality.includes("720")) return "8.2";
  return "8.0";
}

export function GenreTag({ genre }) {
  const g = genreColors[genre] || {
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.15)",
    text: "#aaa",
  };

  return (
    <span
      style={{
        background: g.bg,
        border: `1px solid ${g.border}`,
        color: g.text,
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        letterSpacing: ".5px",
      }}
    >
      {genre || "Unknown"}
    </span>
  );
}

function AuthModal({ open, title, message, buttonText, onClose, onAction }) {
  if (!open) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        <button className="auth-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="auth-modal-icon">
          <User size={28} />
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="auth-modal-actions">
          <button className="auth-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="auth-login-btn" onClick={onAction}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ m, onPlay, onFavorite }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="movie-card"
      onClick={() => onPlay?.(m)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="movie-thumb">
        <img
          src={getPoster(m)}
          alt={m.title}
          className="movie-thumb-img"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div
          className="movie-thumb-overlay"
          style={{ opacity: hovered ? 1 : 0 }}
        />
        <div className="play-circle" style={{ opacity: hovered ? 1 : 0 }}>
          <Play size={14} fill="white" color="white" />
        </div>
      </div>

      <div className="movie-info">
        <div className="movie-title">{m.title}</div>
        <div className="movie-meta">
          <GenreTag genre={m.genre} />
          <span className="movie-rating">★ {getDisplayRating(m)}</span>
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(m);
            }}
            style={{
              width: "100%",
              height: 38,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Heart size={15} />
            Add Favorite
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onNavigate, onSelectMovie, movies, loading, onFavorite }) {
  const featuredMovie = movies[0] || null;
  const continueItems = movies.slice(0, 3).map((movie, index) => ({
    ...movie,
    e: movie.type
      ? `${movie.type.toUpperCase()} • ${movie.language || "N/A"}`
      : "Continue watching",
    p: [45, 30, 65][index] || 40,
  }));

  const stats = [
    {
      val: String(
        movies.filter((m) => (m.type || "").toLowerCase() === "movie").length
      ),
      label: "Total Movies",
      change: "Live from database",
      accent: "rgba(229,9,20,0.15)",
      icon: <Film size={18} color="#e50914" />,
    },
    {
      val: String(
        movies.filter((m) => (m.type || "").toLowerCase() === "series").length
      ),
      label: "Trailer",
      change: "Live from database",
      accent: "rgba(56,189,248,0.12)",
      icon: <Tv size={18} color="#38bdf8" />,
    },
    {
      val: String(movies.filter((m) => getPlayableUrl(m)).length),
      label: "Playable Titles",
      change: "Has video/HLS URL",
      accent: "rgba(245,197,24,0.12)",
      icon: <Star size={18} color="#f5c518" />,
    },
    {
      val: String(movies.length),
      label: "Library Items",
      change: "Published content",
      accent: "rgba(74,222,128,0.12)",
      icon: <User size={18} color="#4ade80" />,
    },
  ];

  const openPlayer = (movie) => {
    if (!movie) return;
    onSelectMovie?.(movie);
  };

  return (
    <div className="page-wrap">
      {loading ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            color: "#cbd5e1",
          }}
        >
          Loading dashboard content...
        </div>
      ) : featuredMovie ? (
        <div className="hero" onClick={() => openPlayer(featuredMovie)}>
          <div className="hero-bg" />
          <div className="hero-pattern" />

          <div className="hero-poster">
            <img
              src={getPoster(featuredMovie)}
              alt="Featured Movie"
              className="hero-poster-img"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          <div className="hero-content">
            <div className="hero-badge">
              <Star size={10} fill="currentColor" /> Featured from DB
            </div>

            <div className="hero-title">{featuredMovie.title}</div>

            <div className="hero-meta">
              <span className="hero-rating">★ {getDisplayRating(featuredMovie)}</span>
              <span>{featuredMovie.year || "N/A"}</span>
              <span>{featuredMovie.quality || "N/A"}</span>
              <span>{featuredMovie.language || "N/A"}</span>
              <GenreTag genre={featuredMovie.genre} />
            </div>

            <div className="hero-desc">
              {featuredMovie.description || "No description available."}
            </div>

            <div className="hero-actions">
              <button
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  openPlayer(featuredMovie);
                }}
              >
                <Play size={14} fill="white" /> Play Now
              </button>

              <button
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate("movies");
                }}
              >
                <Plus size={14} /> Browse Library
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            color: "#cbd5e1",
          }}
        >
          No database content found.
        </div>
      )}

      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-card" key={s.label} style={{ "--accent": s.accent }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Continue Watching</div>
        <span className="see-all" onClick={() => onNavigate("movies")}>
          See All <ChevronRight size={14} />
        </span>
      </div>

      <div className="continue-row">
        {continueItems.length ? (
          continueItems.map((c) => (
            <div
              className="continue-card"
              key={c.id || c.title}
              onClick={() => openPlayer(c)}
            >
              <div className="continue-thumb">
                <img
                  src={getPoster(c)}
                  alt={c.title}
                  className="continue-thumb-img"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="continue-info">
                <div className="continue-title">{c.title}</div>
                <div className="continue-ep">{c.e}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.p}%` }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8" }}>No items available.</div>
        )}
      </div>

      <div className="section-header">
        <div className="section-title">Trending Now</div>
        <span className="see-all" onClick={() => onNavigate("movies")}>
          See All <ChevronRight size={14} />
        </span>
      </div>

      <div className="trending-ribbon">
        {movies.length ? (
          movies.map((m, i) => (
            <div
              className="trending-item"
              key={m.id || m.title}
              onClick={() => openPlayer(m)}
            >
              <div className="trending-num">{i + 1}</div>
              <div className="trending-thumb">
                <img
                  src={getPoster(m)}
                  alt={m.title}
                  className="trending-thumb-img"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8" }}>No items available.</div>
        )}
      </div>

      <div className="section-header">
        <div className="section-title">Recommended For You</div>
        <span className="see-all" onClick={() => onNavigate("movies")}>
          See All <ChevronRight size={14} />
        </span>
      </div>

      <div className="movies-grid">
        {movies.length ? (
          movies.slice(0, 6).map((m) => (
            <MovieCard
              key={m.id || m.title}
              m={m}
              onPlay={openPlayer}
              onFavorite={onFavorite}
            />
          ))
        ) : (
          <div style={{ color: "#94a3b8" }}>No recommendations available.</div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [dbMovies, setDbMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName") || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoadingMovies(true);
        const res = await fetch(`${API_BASE}/api/movies`);
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.movies)) {
          setDbMovies(data.movies);
          if (data.movies.length) {
            setSelectedMovie((prev) => prev || data.movies[0]);
          }
        } else {
          setDbMovies([]);
        }
      } catch (error) {
        console.error("Home fetch movies error:", error);
        setDbMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, []);

  const toggleFavorite = (movie) => {
    if (!movie?.id) return;

    const favoriteIds = JSON.parse(localStorage.getItem("favoriteMovies") || "[]");
    const exists = favoriteIds.includes(movie.id);

    let updatedIds = [];

    if (exists) {
      updatedIds = favoriteIds.filter((id) => id !== movie.id);
    } else {
      updatedIds = [...favoriteIds, movie.id];
    }

    localStorage.setItem("favoriteMovies", JSON.stringify(updatedIds));
    alert(exists ? "Removed from favorites" : "Added to favorites");
  };

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      badge: null,
    },
    {
      key: "movies",
      label: "Movies",
      icon: <Film size={18} />,
      badge: "DB",
    },
    {
      key: "series",
      label: "Trailer",
      icon: <Tv size={18} />,
      badge: null,
    },
    {
      key: "player",
      label: "Now Playing",
      icon: <PlayCircle size={18} />,
      badge: selectedMovie ? "LIVE" : null,
    },
    {
      key: "favorite",
      label: "Favorite",
      icon: <Heart size={18} />,
      badge: null,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      badge: "3",
    },
    {
      key: "customer-care",
      label: "Customer Care",
      icon: <Headset size={18} />,
      badge: null,
    },
    {
      key: "profile",
      label: "Profile",
      icon: <User size={18} />,
      badge: null,
    },
  ];

  const titles = {
    dashboard: "Dashboard",
    movies: "Movies",
    series: "Trailer",
    player: "Now Playing",
    favorite: "Favorite",
    notifications: "Notifications",
    "customer-care": "Customer Care",
    profile: "My Profile",
  };

  const goToLoginPage = () => {
    setShowLoginModal(false);
    window.location.href = "/login";
  };

  const handleProtectedNavigation = (page) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleOpenPlayer = (movie) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setSelectedMovie(movie || null);
    setActivePage("player");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");

    setShowLogoutModal(false);
    window.location.href = "/login";
  };

  const renderPage = () => {
    switch (activePage) {
      case "movies":
        return (
          <Movies
            onNavigate={handleProtectedNavigation}
            onSelectMovie={handleOpenPlayer}
          />
        );

      case "series":
        return (
          <Series
            onNavigate={handleProtectedNavigation}
            GenreTag={GenreTag}
          />
        );

      case "player":
        return (
          <Player
            onNavigate={handleProtectedNavigation}
            GenreTag={GenreTag}
            selectedMovie={selectedMovie}
          />
        );

      case "favorite":
        return <Favorite onSelectMovie={handleOpenPlayer} />;

      case "notifications":
        return <Notification />;

      case "customer-care":
        return <CustomerCare />;

      case "profile":
        return <Profile />;

      default:
        return (
          <Dashboard
            onNavigate={handleProtectedNavigation}
            onSelectMovie={handleOpenPlayer}
            movies={dbMovies}
            loading={loadingMovies}
            onFavorite={toggleFavorite}
          />
        );
    }
  };

  return (
    <>
      <div className="home-layout">
        <style>{`
          .auth-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }

          .auth-modal-box {
            width: 100%;
            max-width: 420px;
            background: linear-gradient(180deg, #11131b, #0d0f15);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 26px;
            position: relative;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.45);
          }

          .auth-close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.08);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .auth-modal-icon {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(229,9,20,0.14);
            color: #e50914;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }

          .auth-modal-box h2 {
            color: #fff;
            margin: 0 0 10px;
            font-size: 24px;
            font-weight: 800;
          }

          .auth-modal-box p {
            color: #c7ced9;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 22px;
          }

          .auth-modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }

          .auth-cancel-btn,
          .auth-login-btn {
            height: 44px;
            border: none;
            border-radius: 12px;
            padding: 0 18px;
            font-weight: 700;
            cursor: pointer;
          }

          .auth-cancel-btn {
            background: rgba(255,255,255,0.08);
            color: #fff;
          }

          .auth-login-btn {
            background: linear-gradient(180deg, #ff3b3b, #e50914);
            color: #fff;
            box-shadow: 0 12px 28px rgba(229,9,20,0.35);
          }

          .movie-thumb {
            position: relative;
            height: 220px;
            overflow: hidden;
            border-radius: 16px;
          }

          .movie-thumb-img,
          .hero-poster-img,
          .continue-thumb-img,
          .trending-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .hero-poster {
            overflow: hidden;
            border-radius: 18px;
          }

          .continue-thumb {
            width: 88px;
            height: 88px;
            border-radius: 14px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .trending-thumb {
            width: 120px;
            height: 160px;
            border-radius: 14px;
            overflow: hidden;
          }
        `}</style>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <aside className={`sidebar ${mobileMenuOpen ? "show" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">H</div>
              <div>
                <div className="logo-text">HFLIX</div>
                <div className="logo-tag">Premium Streaming</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-label">Menu</div>

              {navItems.map((item) => (
                <button
                  key={item.key}
                  className={`nav-item ${activePage === item.key ? "active" : ""}`}
                  onClick={() => handleProtectedNavigation(item.key)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>

            <div className="nav-section">
              <div className="nav-label">More</div>

              <button className="nav-item">
                <span className="menu-icon">
                  <Settings size={18} />
                </span>
                <span>Settings</span>
              </button>
            </div>
          </nav>

          <div className="sidebar-user">
            <div className="user-card">
              <div className="user-avatar-sm">{userInitial}</div>

              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-plan">⭐ Premium</div>
              </div>

              <button
                className="logout-icon-btn"
                title="Logout"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="topbar">
            <span className="topbar-title">{titles[activePage]}</span>

            <div className="search-box">
              <Search size={14} color="#8a8a9a" />
              <input type="text" placeholder="Search movies, series, actors..." />
            </div>

            <div className="topbar-actions">
              <div
                className="icon-btn notif-wrap"
                onClick={() => handleProtectedNavigation("notifications")}
                style={{ cursor: "pointer" }}
                title="Notifications"
              >
                <Bell size={16} />
                <div className="notif-dot" />
              </div>

              <div
                className="icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleProtectedNavigation("favorite")}
                title="Favorite"
              >
                <Heart size={16} />
              </div>

              <div
                className="icon-btn"
                style={{ cursor: "pointer" }}
                onClick={() => handleProtectedNavigation("customer-care")}
                title="Customer Care"
              >
                <Headset size={16} />
              </div>

              <div
                className="user-avatar-sm"
                style={{ cursor: "pointer" }}
                onClick={() => handleProtectedNavigation("profile")}
              >
                {userInitial}
              </div>
            </div>
          </div>

          {renderPage()}
        </main>
      </div>

      <AuthModal
        open={showLoginModal}
        title="Login Required"
        message="Please login to continue watching movies and series."
        buttonText="Login to Continue"
        onClose={() => setShowLoginModal(false)}
        onAction={goToLoginPage}
      />

      <AuthModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account?"
        buttonText="Yes, Logout"
        onClose={() => setShowLogoutModal(false)}
        onAction={handleLogout}
      />
    </>
  );
}

export default Home;