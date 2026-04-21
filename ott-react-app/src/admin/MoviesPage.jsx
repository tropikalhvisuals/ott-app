import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Film,
  Star,
  CalendarDays,
  Clapperboard,
  PlayCircle,
  Layers3,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const STATUS_COLOR = {
  published: "#10b981",
  draft: "#f59e0b",
};

const TYPE_COLOR = {
  movie: "#3b82f6",
  trailer: "#ef4444",
  series: "#8b5cf6",
};

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80";

const createEmptyForm = () => ({
  id: null,
  title: "",
  type: "movie",
  genre: "",
  year: new Date().getFullYear(),
  description: "",
  language: "English",
  quality: "HD",
  status: "published",
});

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(createEmptyForm());

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/movies`);
      const data = await res.json();

      if (data?.success && Array.isArray(data.movies)) {
        setMovies(data.movies);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Fetch movies error:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const genreOptions = useMemo(() => {
    const uniqueGenres = new Set(
      movies.map((item) => item.genre).filter(Boolean)
    );
    return ["All", ...Array.from(uniqueGenres)];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const text = `
        ${movie.title || ""}
        ${movie.genre || ""}
        ${movie.status || ""}
        ${movie.year || ""}
        ${movie.type || ""}
        ${movie.language || ""}
      `.toLowerCase();

      const matchesQuery = text.includes(localQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        String(movie.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesGenre =
        genreFilter === "All" || movie.genre === genreFilter;

      const matchesType =
        typeFilter === "All" ||
        String(movie.type || "").toLowerCase() === typeFilter.toLowerCase();

      return matchesQuery && matchesStatus && matchesGenre && matchesType;
    });
  }, [movies, localQuery, statusFilter, genreFilter, typeFilter]);

  const totalContents = movies.length;
  const totalMovies = movies.filter(
    (m) => String(m.type).toLowerCase() === "movie"
  ).length;
  const totalTrailers = movies.filter(
    (m) => String(m.type).toLowerCase() === "trailer"
  ).length;
  const publishedCount = movies.filter(
    (m) => String(m.status).toLowerCase() === "published"
  ).length;

  const getPoster = (movie) => movie.thumbnail_url || FALLBACK_POSTER;

  const getTypeLabel = (type) => {
    const value = String(type || "").toLowerCase();
    if (value === "movie") return "Movie";
    if (value === "trailer") return "Trailer";
    if (value === "series") return "Series";
    return "Content";
  };

  const openEditModal = (movie) => {
    setForm({
      id: movie.id,
      title: movie.title || "",
      type: movie.type || "movie",
      genre: movie.genre || "",
      year: movie.year || new Date().getFullYear(),
      description: movie.description || "",
      language: movie.language || "English",
      quality: movie.quality || "HD",
      status: movie.status || "published",
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setForm(createEmptyForm());
    setOpenModal(false);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.id) {
      alert("Invalid content ID");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter title");
      return;
    }

    if (!form.genre.trim()) {
      alert("Please enter genre");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/content/${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          genre: form.genre,
          year: form.year,
          description: form.description,
          language: form.language,
          quality: form.quality,
          status: form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      await fetchMovies();
      closeModal();
      alert("Content updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this content?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/content/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      setMovies((prev) => prev.filter((item) => item.id !== id));
      alert("Content deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Delete failed");
    }
  };

  const styles = {
    page: {
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
        "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    },

    statTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      gap: 12,
    },

    statLabel: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 13,
      fontWeight: 600,
    },

    statValue: {
      fontSize: 30,
      fontWeight: 900,
      color: "#fff",
      lineHeight: 1.05,
      marginTop: 8,
    },

    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.34)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff3b3b",
      flexShrink: 0,
    },

    toolbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
    },

    leftTools: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      flex: 1,
    },

    searchWrap: {
      minWidth: 280,
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
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
    },

    movieCard: {
      borderRadius: 22,
      overflow: "hidden",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
    },

    posterWrap: {
      position: "relative",
      height: 220,
      overflow: "hidden",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "#111",
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

    posterBadges: {
      position: "absolute",
      top: 12,
      left: 12,
      right: 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },

    badge: (color) => ({
      padding: "7px 12px",
      borderRadius: 999,
      background: `${color}18`,
      border: `1px solid ${color}50`,
      color,
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: "nowrap",
      backdropFilter: "blur(6px)",
    }),

    posterBottom: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    miniInfo: {
      fontSize: 12,
      color: "rgba(255,255,255,0.85)",
      fontWeight: 700,
      background: "rgba(0,0,0,0.45)",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
    },

    cardBody: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    title: {
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
      lineHeight: 1.3,
    },

    desc: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 13,
      lineHeight: 1.6,
      minHeight: 42,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },

    metaGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },

    metaItem: {
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
      padding: 28,
      textAlign: "center",
      color: "rgba(255,255,255,0.52)",
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
    },

    loading: {
      padding: 28,
      textAlign: "center",
      color: "rgba(255,255,255,0.60)",
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      padding: 18,
    },

    modal: {
      width: "100%",
      maxWidth: 620,
      borderRadius: 24,
      background:
        "linear-gradient(180deg, rgba(15,15,20,0.98), rgba(10,10,14,0.98))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      overflow: "hidden",
    },

    modalHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },

    modalTitle: {
      margin: 0,
      fontSize: 20,
      fontWeight: 800,
      color: "#fff",
    },

    modalBody: {
      padding: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },

    full: {
      gridColumn: "1 / -1",
    },

    label: {
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      fontWeight: 600,
    },

    input: {
      minHeight: 48,
      borderRadius: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
    },

    textarea: {
      minHeight: 100,
      borderRadius: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
      resize: "vertical",
    },

    modalFooter: {
      padding: 20,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
    },

    ghostBtn: {
      height: 46,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "0 18px",
      fontWeight: 700,
      cursor: "pointer",
    },

    primaryBtn: {
      height: 46,
      borderRadius: 14,
      border: "1px solid rgba(229,9,20,0.35)",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "0 18px",
      fontWeight: 800,
      cursor: "pointer",
    },

    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
  };

  if (loading) {
    return <div style={styles.loading}>Loading stored movies and trailers...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Total Content</div>
              <div style={styles.statValue}>{totalContents}</div>
            </div>
            <div style={styles.statIcon}>
              <Layers3 size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Movies</div>
              <div style={styles.statValue}>{totalMovies}</div>
            </div>
            <div style={styles.statIcon}>
              <Film size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Trailers</div>
              <div style={styles.statValue}>{totalTrailers}</div>
            </div>
            <div style={styles.statIcon}>
              <PlayCircle size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Published</div>
              <div style={styles.statValue}>{publishedCount}</div>
            </div>
            <div style={styles.statIcon}>
              <Clapperboard size={20} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.leftTools}>
          <div style={styles.searchWrap}>
            <Search size={16} color="rgba(255,255,255,0.45)" />
            <input
              style={styles.searchInput}
              placeholder="Search by title, genre, type, language, year..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </div>

          <select
            style={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option style={{ background: "#111" }} value="All">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option style={{ background: "#111" }} value="All">
              All Status
            </option>
            <option style={{ background: "#111" }} value="published">
              Published
            </option>
            <option style={{ background: "#111" }} value="draft">
              Draft
            </option>
          </select>

          <select
            style={styles.select}
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            {genreOptions.map((genre) => (
              <option key={genre} style={{ background: "#111" }} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div style={styles.empty}>No stored movie or trailer data found.</div>
      ) : (
        <div style={styles.grid}>
          {filteredMovies.map((movie) => {
            const statusKey = String(movie.status || "").toLowerCase();
            const typeKey = String(movie.type || "").toLowerCase();

            return (
              <div key={movie.id} style={styles.movieCard}>
                <div style={styles.posterWrap}>
                  <img
                    src={getPoster(movie)}
                    alt={movie.title}
                    style={styles.poster}
                  />
                  <div style={styles.posterOverlay} />

                  <div style={styles.posterBadges}>
                    <div style={styles.badge(TYPE_COLOR[typeKey] || "#999999")}>
                      {getTypeLabel(movie.type)}
                    </div>

                    <div
                      style={styles.badge(
                        STATUS_COLOR[statusKey] || "#999999"
                      )}
                    >
                      {movie.status || "unknown"}
                    </div>
                  </div>

                  <div style={styles.posterBottom}>
                    <div style={styles.miniInfo}>
                      {movie.language || "English"}
                    </div>
                    <div style={styles.miniInfo}>
                      {movie.quality || "HD"}
                    </div>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.title}>{movie.title}</h3>

                  <div style={styles.desc}>
                    {movie.description || "No description available."}
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Genre</div>
                      <div style={styles.metaValue}>{movie.genre || "-"}</div>
                    </div>

                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Year</div>
                      <div style={styles.metaValue}>
                        <CalendarDays size={15} />
                        {movie.year || "-"}
                      </div>
                    </div>

                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Type</div>
                      <div style={styles.metaValue}>
                        {getTypeLabel(movie.type)}
                      </div>
                    </div>

                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Quality</div>
                      <div style={styles.metaValue}>
                        <Star size={15} />
                        {movie.quality || "HD"}
                      </div>
                    </div>
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      style={styles.btn}
                      onClick={() => openEditModal(movie)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      style={styles.btn}
                      onClick={() => handleDelete(movie.id)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Content</h3>
              <button style={styles.closeBtn} onClick={closeModal}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={styles.modalBody}>
                <div style={{ ...styles.field, ...styles.full }}>
                  <label style={styles.label}>Title</label>
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.input}
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
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
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Genre</label>
                  <input
                    style={styles.input}
                    value={form.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                    placeholder="Action"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Year</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    placeholder="2025"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Language</label>
                  <input
                    style={styles.input}
                    value={form.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    placeholder="English"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Quality</label>
                  <input
                    style={styles.input}
                    value={form.quality}
                    onChange={(e) => handleChange("quality", e.target.value)}
                    placeholder="HD"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option style={{ background: "#111" }} value="published">
                      published
                    </option>
                    <option style={{ background: "#111" }} value="draft">
                      draft
                    </option>
                  </select>
                </div>

                <div style={{ ...styles.field, ...styles.full }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.ghostBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={saving}>
                  {saving ? "Updating..." : "Update Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}