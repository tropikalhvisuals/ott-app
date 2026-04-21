import { useEffect, useMemo, useState } from "react";
import { Heart, Play, Trash2, Search, Star, CalendarDays } from "lucide-react";

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

function getPoster(movie) {
  return movie?.thumbnail_url || movie?.image || FALLBACK_IMAGE;
}

function getDisplayRating(movie) {
  if (movie?.rating) return movie.rating;

  const quality = (movie?.quality || "").toLowerCase();
  if (quality.includes("4k")) return "9.0";
  if (quality.includes("1080")) return "8.7";
  if (quality.includes("720")) return "8.2";
  return "8.0";
}

export default function Favorite({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/movies`);
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.movies)) {
          const favoriteIds = JSON.parse(localStorage.getItem("favoriteMovies") || "[]");
          const favMovies = data.movies.filter((movie) => favoriteIds.includes(movie.id));
          setMovies(favMovies);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Favorite fetch error:", error);
        setMovies([]);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const text = `
        ${movie.title || ""}
        ${movie.genre || ""}
        ${movie.language || ""}
        ${movie.quality || ""}
        ${movie.year || ""}
      `.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [movies, search]);

  const removeFavorite = (id) => {
    const favoriteIds = JSON.parse(localStorage.getItem("favoriteMovies") || "[]");
    const updatedIds = favoriteIds.filter((item) => item !== id);
    localStorage.setItem("favoriteMovies", JSON.stringify(updatedIds));
    setMovies((prev) => prev.filter((movie) => movie.id !== id));
  };

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
        padding: 24,
    },

    hero: {
      borderRadius: 24,
      padding: 24,
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

    desc: {
      marginTop: 10,
      color: "rgba(255,255,255,0.60)",
      fontSize: 14,
      lineHeight: 1.7,
      maxWidth: 700,
    },

    statBox: {
      marginTop: 18,
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 16px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      fontWeight: 700,
    },

    searchWrap: {
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

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 18,
    },

    card: {
      borderRadius: 22,
      overflow: "hidden",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
    },

    posterWrap: {
      position: "relative",
      height: 240,
      background: "#111",
      overflow: "hidden",
    },

    poster: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    posterOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15), transparent)",
    },

    favoriteBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 42,
      height: 42,
      borderRadius: 14,
      background: "rgba(229,9,20,0.18)",
      border: "1px solid rgba(229,9,20,0.45)",
      color: "#ff4d4f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    qualityBadge: {
      position: "absolute",
      left: 14,
      bottom: 14,
      color: "#fff",
      background: "rgba(0,0,0,0.45)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 999,
      padding: "6px 10px",
      fontSize: 12,
      fontWeight: 700,
    },

    body: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    movieTitle: {
      margin: 0,
      color: "#fff",
      fontSize: 18,
      fontWeight: 800,
      lineHeight: 1.3,
    },

    movieDesc: {
      color: "rgba(255,255,255,0.58)",
      fontSize: 13,
      lineHeight: 1.6,
      minHeight: 40,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },

    metaRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },

    metaBox: {
      padding: 12,
      borderRadius: 14,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
    },

    metaLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.45)",
      marginBottom: 6,
    },

    metaValue: {
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    actionRow: {
      display: "flex",
      gap: 10,
      marginTop: 4,
    },

    btn: {
      flex: 1,
      height: 42,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    empty: {
      padding: 34,
      textAlign: "center",
      color: "rgba(255,255,255,0.54)",
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h2 style={styles.title}>My Favorites</h2>
        <div style={styles.desc}>
          Your liked movies and trailers are shown here. You can play them again
          or remove them from favorites.
        </div>

        <div style={styles.statBox}>
          <Heart size={18} color="#ff4d4f" fill="#ff4d4f" />
          {movies.length} Favorite Items
        </div>
      </div>

      <div style={styles.searchWrap}>
        <Search size={16} color="rgba(255,255,255,0.45)" />
        <input
          style={styles.searchInput}
          placeholder="Search favorites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredMovies.length === 0 ? (
        <div style={styles.empty}>No favorite movies found.</div>
      ) : (
        <div style={styles.grid}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} style={styles.card}>
              <div style={styles.posterWrap}>
                <img
                  src={getPoster(movie)}
                  alt={movie.title}
                  style={styles.poster}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div style={styles.posterOverlay} />

                <div style={styles.favoriteBadge}>
                  <Heart size={18} fill="currentColor" />
                </div>

                <div style={styles.qualityBadge}>
                  {movie.quality || "HD"}
                </div>
              </div>

              <div style={styles.body}>
                <h3 style={styles.movieTitle}>{movie.title}</h3>

                <div style={styles.movieDesc}>
                  {movie.description || "No description available."}
                </div>

                <div style={styles.metaRow}>
                  <div style={styles.metaBox}>
                    <div style={styles.metaLabel}>Genre</div>
                    <div style={styles.metaValue}>{movie.genre || "-"}</div>
                  </div>

                  <div style={styles.metaBox}>
                    <div style={styles.metaLabel}>Year</div>
                    <div style={styles.metaValue}>
                      <CalendarDays size={15} />
                      {movie.year || "-"}
                    </div>
                  </div>

                  <div style={styles.metaBox}>
                    <div style={styles.metaLabel}>Language</div>
                    <div style={styles.metaValue}>{movie.language || "English"}</div>
                  </div>

                  <div style={styles.metaBox}>
                    <div style={styles.metaLabel}>Rating</div>
                    <div style={styles.metaValue}>
                      <Star size={15} />
                      {getDisplayRating(movie)}
                    </div>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  <button
                    style={styles.btn}
                    onClick={() => onSelectMovie?.(movie)}
                  >
                    <Play size={15} fill="white" />
                    Play
                  </button>

                  <button
                    style={styles.btn}
                    onClick={() => removeFavorite(movie.id)}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}