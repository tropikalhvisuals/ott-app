import { useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal,
  Search,
  PlayCircle,
  RefreshCw,
  Film,
  Tv,
  Star,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <rect width="500" height="750" fill="#0f172a"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#94a3b8" font-size="34" font-family="Arial, sans-serif">No Image</text>
    </svg>
  `);

function getPoster(movie) {
  return movie?.thumbnail_url || FALLBACK_POSTER;
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

function getStatusBadge(movie) {
  if (movie?.transcode_status === "completed" && movie?.hls_master_url) {
    return { text: "Ready", className: "ready" };
  }
  if (movie?.transcode_status === "pending") {
    return { text: "Processing", className: "pending" };
  }
  if (getPlayableUrl(movie)) {
    return { text: "Playable", className: "playable" };
  }
  return { text: "No Video", className: "novideo" };
}

export default function Movies({ onNavigate, onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/movies`);
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch movies");
      }

      setMovies(Array.isArray(data.movies) ? data.movies : []);
    } catch (err) {
      console.error("Movies fetch error:", err);
      setError("Failed to load movies from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const genres = useMemo(() => {
    const list = movies
      .map((movie) => movie.genre)
      .filter(Boolean)
      .filter((genre, index, arr) => arr.indexOf(genre) === index);

    return ["All", ...list];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (activeGenre !== "All") {
      result = result.filter((movie) => movie.genre === activeGenre);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((movie) => {
        return (
          (movie.title || "").toLowerCase().includes(q) ||
          (movie.genre || "").toLowerCase().includes(q) ||
          (movie.language || "").toLowerCase().includes(q) ||
          (movie.type || "").toLowerCase().includes(q) ||
          (movie.description || "").toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      if (sortBy === "A-Z") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "Rating") {
        return parseFloat(getDisplayRating(b)) - parseFloat(getDisplayRating(a));
      }
      if (sortBy === "Year") {
        return Number(b.year || 0) - Number(a.year || 0);
      }
      return Number(b.id || 0) - Number(a.id || 0);
    });

    return result;
  }, [movies, activeGenre, search, sortBy]);

  const handlePlayMovie = (movie) => {
    onSelectMovie?.(movie);
  };

  const totalMovies = movies.filter(
    (m) => (m.type || "").toLowerCase() === "movie"
  ).length;

  const totalSeries = movies.filter(
    (m) => (m.type || "").toLowerCase() === "series"
  ).length;

  const readyCount = movies.filter(
    (m) => m.hls_master_url || m.video_url || m.source_video_url
  ).length;

  return (
    <div className="page-wrap">
      <div className="page-top">
        <div>
          <h1 className="page-title">Movies Library</h1>
          <p className="page-subtitle">Stored content from your database</p>
        </div>

        <button className="refresh-btn" onClick={fetchMovies}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <Film size={18} />
          </div>
          <div>
            <div className="stat-value">{totalMovies}</div>
            <div className="stat-label">Movies</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Tv size={18} />
          </div>
          <div>
            <div className="stat-value">{totalSeries}</div>
            <div className="stat-label">Series</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon gold">
            <PlayCircle size={18} />
          </div>
          <div>
            <div className="stat-value">{readyCount}</div>
            <div className="stat-label">Playable</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search title, genre, language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-wrap">
          <SlidersHorizontal size={15} color="#9ca3af" />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Latest">Latest</option>
            <option value="Year">Year</option>
            <option value="Rating">Rating</option>
            <option value="A-Z">A-Z</option>
          </select>
        </div>
      </div>

      <div className="filter-bar">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`filter-chip ${activeGenre === genre ? "active" : ""}`}
            onClick={() => setActiveGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">All Stored Content</div>
        <span className="movie-count">{filteredMovies.length} titles</span>
      </div>

      {loading ? (
        <div className="state-box">Loading movies...</div>
      ) : error ? (
        <div className="state-box error">{error}</div>
      ) : filteredMovies.length === 0 ? (
        <div className="state-box">No movies found.</div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map((movie) => {
            const badge = getStatusBadge(movie);
            const playable = !!getPlayableUrl(movie);

            return (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => playable && handlePlayMovie(movie)}
              >
                <div className="movie-poster-wrap">
                  <img
                    src={getPoster(movie)}
                    alt={movie.title || "movie"}
                    className="movie-poster"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />

                  <div className="poster-overlay" />

                  <div className="poster-top">
                    <span className={`status-badge ${badge.className}`}>
                      {badge.text}
                    </span>
                    <span className="type-badge">
                      {(movie.type || "movie").toUpperCase()}
                    </span>
                  </div>

                  <div className="poster-bottom">
                    <button
                      className="play-circle-btn"
                      disabled={!playable}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playable) handlePlayMovie(movie);
                      }}
                    >
                      <PlayCircle size={44} />
                    </button>
                  </div>
                </div>

                <div className="movie-info">
                  <h3 className="movie-title">{movie.title || "Untitled"}</h3>

                  <p className="movie-meta">
                    {movie.genre || "Unknown"} • {movie.year || "N/A"}
                  </p>

                  <div className="movie-tags">
                    <span className="tag">{movie.language || "N/A"}</span>
                    <span className="tag quality">{movie.quality || "HD"}</span>
                    <span className="tag dark">{movie.status || "published"}</span>
                  </div>

                  <p className="movie-desc">
                    {movie.description || "No description available."}
                  </p>

                  <div className="movie-footer">
                    <span className="movie-rating">
                      <Star size={14} fill="currentColor" />
                      {getDisplayRating(movie)}
                    </span>

                    <button
                      className="play-btn"
                      disabled={!playable}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playable) handlePlayMovie(movie);
                      }}
                    >
                      {playable ? "Play" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .page-wrap {
          padding: 24px;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(229,9,20,0.08), transparent 22%),
            #070b14;
          color: #fff;
        }

        .page-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .page-title {
          margin: 0;
          font-size: 32px;
          font-weight: 900;
        }

        .page-subtitle {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .refresh-btn {
          height: 44px;
          padding: 0 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #e50914, #ff3c45);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
        }

        .stat-icon.red {
          background: rgba(229,9,20,0.14);
          color: #ff5f67;
        }

        .stat-icon.blue {
          background: rgba(59,130,246,0.14);
          color: #60a5fa;
        }

        .stat-icon.gold {
          background: rgba(245,158,11,0.14);
          color: #fbbf24;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 900;
        }

        .stat-label {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 13px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .search-box {
          flex: 1;
          min-width: 260px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 14px;
        }

        .search-box input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
        }

        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 11px 12px;
          border-radius: 12px;
        }

        .sort-select {
          background: transparent;
          color: #fff;
          border: none;
          outline: none;
          font-size: 14px;
          cursor: pointer;
        }

        .sort-select option {
          background: #111827;
          color: #fff;
        }

        .filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .filter-chip {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .filter-chip.active {
          background: #e50914;
          color: #fff;
          border-color: #e50914;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 12px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 900;
        }

        .movie-count {
          font-size: 13px;
          color: #94a3b8;
        }

        .state-box {
          padding: 28px;
          text-align: center;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1;
        }

        .state-box.error {
          color: #fca5a5;
          border-color: rgba(239,68,68,0.25);
        }

        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 22px;
        }

        .movie-card {
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, #101827 0%, #0b1220 100%);
          box-shadow: 0 12px 28px rgba(0,0,0,0.28);
          transition: 0.28s ease;
          cursor: pointer;
        }

        .movie-card:hover {
          transform: translateY(-6px);
        }

        .movie-poster-wrap {
          position: relative;
          width: 100%;
          height: 330px;
          overflow: hidden;
          background: #0f172a;
        }

        .movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .poster-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.18));
        }

        .poster-top {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
        }

        .poster-bottom {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 18px;
          display: flex;
          justify-content: center;
        }

        .status-badge,
        .type-badge {
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
        }

        .status-badge.ready {
          background: rgba(34,197,94,0.16);
          color: #86efac;
          border: 1px solid rgba(34,197,94,0.3);
        }

        .status-badge.pending {
          background: rgba(245,158,11,0.16);
          color: #fcd34d;
          border: 1px solid rgba(245,158,11,0.3);
        }

        .status-badge.playable {
          background: rgba(59,130,246,0.16);
          color: #93c5fd;
          border: 1px solid rgba(59,130,246,0.3);
        }

        .status-badge.novideo {
          background: rgba(239,68,68,0.16);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.3);
        }

        .type-badge {
          background: rgba(15,23,42,0.75);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .play-circle-btn {
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .play-circle-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .movie-info {
          padding: 16px;
        }

        .movie-title {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .movie-meta {
          margin: 0 0 12px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .movie-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .tag {
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #dbeafe;
          font-weight: 700;
        }

        .tag.quality {
          background: rgba(229,9,20,0.14);
          color: #ffb4b8;
        }

        .tag.dark {
          background: rgba(15,23,42,0.9);
          color: #cbd5e1;
        }

        .movie-desc {
          font-size: 13px;
          line-height: 1.65;
          color: #9ca3af;
          min-height: 64px;
          margin-bottom: 14px;
        }

        .movie-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .movie-rating {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 800;
          color: #fbbf24;
        }

        .play-btn {
          border: none;
          background: #e50914;
          color: #fff;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .play-btn:disabled {
          background: #475569;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-wrap {
            padding: 16px;
          }

          .movie-poster-wrap {
            height: 290px;
          }

          .page-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}