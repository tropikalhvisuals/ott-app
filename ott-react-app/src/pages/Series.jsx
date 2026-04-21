import { useEffect, useMemo, useState, useRef, useCallback } from "react";

const API_BASE = "http://localhost:5000";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200&q=80";

function getPoster(m) {
  return m?.thumbnail_url || m?.poster_url || FALLBACK_IMAGE;
}

function getVideo(m) {
  return (
    m?.hls_master_url ||
    m?.video_url ||
    m?.source_video_url ||
    ""
  );
}

function getRating(m) {
  return m?.rating || "8.0";
}

function getDuration(m) {
  return m?.trailer_duration || m?.duration || "2:30";
}

const PlayIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const HeartIcon = ({ filled, size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const BookmarkIcon = ({ filled, size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const StarIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function TrailerModal({ movie, onClose }) {
  const videoUrl = getVideo(movie);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>{movie.title}</div>
            <div style={styles.modalMeta}>
              <span style={styles.genrePill}>{movie.genre}</span>
              <span style={styles.metaDot} />
              {movie.year}
              <span style={styles.metaDot} />
              <StarIcon />
              <span style={{ marginLeft: 4 }}>{getRating(movie)}</span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.videoWrap}>
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              style={styles.video}
              poster={getPoster(movie)}
            />
          ) : (
            <div style={styles.noVideoWrap}>
              <img
                src={getPoster(movie)}
                alt={movie.title}
                style={styles.noVideoImg}
              />
              <div style={styles.noVideoOverlay}>
                <div style={styles.noVideoMsg}>No trailer video available</div>
                <div style={styles.noVideoSub}>
                  Trailer video URL not found
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.modalDesc}>
          {movie.description || "No description available."}
        </div>

        <div style={styles.modalFooter}>
          <div style={styles.modalStats}>
            <span style={styles.statItem}>⏱ {getDuration(movie)}</span>
            <span style={styles.statItem}>🎬 Trailer</span>
            <span style={styles.statItem}>{movie.language || "English"}</span>
          </div>
          <div style={styles.modalActions}>
            <button style={styles.actionBtn}>+ Add to list</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrailerCard({ movie, onPlay, onNavigate, onSelectMovie }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay(movie);
  };

  const handleFullPlayer = (e) => {
    e.stopPropagation();
    onSelectMovie?.(movie);
    onNavigate?.("player");
  };

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      <div style={styles.cardThumbWrap}>
        <img
          src={getPoster(movie)}
          alt={movie.title}
          style={styles.cardThumb}
          loading="lazy"
        />
        <div style={{ ...styles.cardPlayOverlay, opacity: hovered ? 1 : 0 }}>
          <div style={styles.playCircle}>
            <PlayIcon size={18} />
          </div>
        </div>
        <div style={styles.durationBadge}>{getDuration(movie)}</div>
        <div style={styles.newBadge}>Trailer</div>
        <div style={styles.ratingBadge}>
          <StarIcon size={10} />
          <span style={{ marginLeft: 3 }}>{getRating(movie)}</span>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardTitle}>{movie.title}</div>
        <div style={styles.cardMeta}>
          <span>{movie.year || "2025"}</span>
          <span style={styles.metaDot} />
          <span>Trailer</span>
          <span style={styles.metaDot} />
          <span>{movie.language || "English"}</span>
        </div>
        <div style={styles.cardFooter}>
          <span style={styles.genrePill}>{movie.genre || "General"}</span>
          <div style={styles.cardActions}>
            <button
              style={{
                ...styles.iconBtn,
                ...(liked ? styles.iconBtnLiked : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
              title="Like"
            >
              <HeartIcon filled={liked} size={13} />
            </button>

            <button
              style={{
                ...styles.iconBtn,
                ...(saved ? styles.iconBtnSaved : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSaved(!saved);
              }}
              title="Save"
            >
              <BookmarkIcon filled={saved} size={13} />
            </button>

            <button
              style={styles.iconBtn}
              onClick={handleFullPlayer}
              title="Open full player"
            >
              <ShareIcon size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrailerListPage({ onNavigate, onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingMovie, setPlayingMovie] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/movies`);
        const data = await res.json();

        if (data?.success && Array.isArray(data.movies)) {
          const trailerOnly = data.movies.filter(
            (item) => String(item.type).toLowerCase() === "trailer"
          );
          setMovies(trailerOnly);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Fetch trailer error:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, []);

  useEffect(() => {
    if (movies.length < 2) return;
    const t = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % movies.length);
    }, 6000);

    return () => clearInterval(t);
  }, [movies]);

  const featured = movies[featuredIndex] || movies[0];

  const filtered = useMemo(() => {
    let list = [...movies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.genre?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.language?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [movies, searchQuery]);

  const handlePlay = useCallback((movie) => setPlayingMovie(movie), []);
  const handleCloseModal = useCallback(() => setPlayingMovie(null), []);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>Loading trailers…</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {playingMovie && (
        <TrailerModal movie={playingMovie} onClose={handleCloseModal} />
      )}

      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>Trailers</div>
      </div>

      <div style={styles.searchBar}>
        <SearchIcon size={15} />
        <input
          ref={searchRef}
          style={styles.searchInput}
          placeholder="Search trailers by title, genre, language…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button style={styles.clearBtn} onClick={() => setSearchQuery("")}>
            <CloseIcon size={13} />
          </button>
        )}
      </div>

      {featured && (
        <div style={styles.hero} onClick={() => handlePlay(featured)}>
          <img
            key={featured.id}
            src={getPoster(featured)}
            alt={featured.title}
            style={styles.heroImg}
          />
          <div style={styles.heroOverlay} />

          <div style={styles.heroDots}>
            {movies.slice(0, 5).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.heroDot,
                  ...(i === featuredIndex ? styles.heroDotActive : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFeaturedIndex(i);
                }}
              />
            ))}
          </div>

          <div style={styles.heroBadge}>🔥 Featured Trailer</div>

          <div style={styles.heroContent}>
            <div style={styles.heroTags}>
              <span style={styles.heroTag}>{featured.genre || "General"}</span>
              <span style={styles.heroTagDot}>•</span>
              <span style={styles.heroTag}>{featured.year || "2025"}</span>
              <span style={styles.heroTagDot}>•</span>
              <span style={styles.heroTag}>Trailer</span>
            </div>

            <div style={styles.heroTitle}>{featured.title}</div>
            <div style={styles.heroDesc}>
              {featured.description || "No description available."}
            </div>

            <div style={styles.heroActions}>
              <button
                style={styles.playBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(featured);
                }}
              >
                <PlayIcon size={16} />
                Watch Trailer
              </button>

              <button
                style={styles.outlineBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMovie?.(featured);
                  onNavigate?.("player");
                }}
              >
                Full Player
              </button>

              <span style={styles.heroDuration}>{getDuration(featured)}</span>
            </div>

            <div style={styles.heroStats}>
              <span>⭐ {getRating(featured)}</span>
              <span style={styles.metaDot} />
              <span>{featured.language || "English"}</span>
              <span style={styles.metaDot} />
              <span>{featured.quality || "HD"}</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.sectionHead}>
        <div style={styles.sectionLabel}>
          Trailer Library{searchQuery && ` · "${searchQuery}"`}
        </div>
        <div style={styles.resultCount}>{filtered.length} trailers</div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎬</div>
          <div style={styles.emptyText}>No trailers found</div>
          <div style={styles.emptySub}>
            Only content with type = trailer will show here
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((m) => (
            <TrailerCard
              key={m.id}
              movie={m}
              onPlay={handlePlay}
              onNavigate={onNavigate}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#07080d",
    color: "#fff",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingWrap: {
    minHeight: "100vh",
    background: "#07080d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingSpinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTop: "3px solid #e53935",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 20,
    color: "rgba(255,255,255,0.5)",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 14,
    flex: 1,
    outline: "none",
    fontFamily: "inherit",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  hero: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 28,
    cursor: "pointer",
    height: 380,
  },
  heroImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.4s",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to right, rgba(0,0,0,0.85) 0%, transparent 65%)",
  },
  heroBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "#e53935",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 5,
    letterSpacing: "0.5px",
    zIndex: 2,
  },
  heroDots: {
    position: "absolute",
    bottom: 16,
    right: 16,
    display: "flex",
    gap: 6,
    zIndex: 3,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  heroDotActive: {
    background: "#fff",
    width: 18,
    borderRadius: 3,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "28px",
    zIndex: 2,
  },
  heroTags: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  heroTag: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  heroTagDot: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
  },
  heroDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 16,
    maxWidth: 500,
    lineHeight: 1.6,
  },
  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  playBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#e53935",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "transform 0.1s",
  },
  outlineBtn: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  heroDuration: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: 600,
  },
  resultCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "transform 0.15s, border-color 0.15s",
  },
  cardHover: {
    transform: "translateY(-4px)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardThumbWrap: {
    position: "relative",
    overflow: "hidden",
  },
  cardThumb: {
    width: "100%",
    height: 130,
    objectFit: "cover",
    display: "block",
    transition: "transform 0.2s",
  },
  cardPlayOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.38)",
    transition: "opacity 0.15s",
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(229,57,53,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(0,0,0,0.78)",
    color: "#fff",
    fontSize: 11,
    padding: "2px 7px",
    borderRadius: 4,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "#e53935",
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.65)",
    color: "#FFD700",
    fontSize: 11,
    padding: "2px 7px",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
  },
  cardBody: {
    padding: "12px",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 10,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    display: "inline-block",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  genrePill: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 4,
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.55)",
  },
  cardActions: {
    display: "flex",
    gap: 5,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.12s",
  },
  iconBtnLiked: {
    color: "#e53935",
    borderColor: "#e53935",
  },
  iconBtnSaved: {
    color: "#FFD700",
    borderColor: "#FFD700",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "rgba(255,255,255,0.3)",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
    color: "rgba(255,255,255,0.5)",
  },
  emptySub: {
    fontSize: 13,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalBox: {
    background: "#12131a",
    borderRadius: 16,
    width: "100%",
    maxWidth: 780,
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "18px 20px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  modalMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.07)",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  videoWrap: {
    position: "relative",
    background: "#000",
    aspectRatio: "16/9",
  },
  video: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  noVideoWrap: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  noVideoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.35,
  },
  noVideoOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noVideoMsg: {
    fontSize: 16,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
  },
  noVideoSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
  modalDesc: {
    padding: "14px 20px",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.65,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    flexWrap: "wrap",
    gap: 10,
  },
  modalStats: {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
  },
  statItem: {},
  modalActions: {},
  actionBtn: {
    background: "#e53935",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};