import { useMemo, useState } from "react";
import {
  Plus,
  X,
  Search,
  Tags,
  Sparkles,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const COLORS = [
  "#e50914",
  "#38bdf8",
  "#34d399",
  "#f59e0b",
  "#a78bfa",
  "#f472b6",
  "#2dd4bf",
  "#fb923c",
];

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 24,
          background:
            "linear-gradient(180deg, rgba(15,15,20,0.98), rgba(10,10,14,0.98))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function GenresPage({ genres = [], setGenres }) {
  const [modal, setModal] = useState(false);
  const [val, setVal] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filteredGenres = useMemo(() => {
    return genres.filter((g) =>
      g.toLowerCase().includes(query.toLowerCase())
    );
  }, [genres, query]);

  const totalGenres = genres.length;
  const filteredCount = filteredGenres.length;
  const uniqueColors = Math.min(genres.length, COLORS.length);

  const save = () => {
    const trimmed = val.trim();
    if (!trimmed) {
      setError("Please enter a genre name.");
      return;
    }

    const exists = genres.some(
      (g) => g.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setError("This genre already exists.");
      return;
    }

    setGenres((prev) => [...prev, trimmed]);
    setVal("");
    setError("");
    setModal(false);
  };

  const removeGenre = (indexToRemove) => {
    const ok = window.confirm("Are you sure you want to delete this genre?");
    if (!ok) return;
    setGenres((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
      gap: 12,
      marginBottom: 10,
    },

    statLabel: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 13,
      fontWeight: 600,
    },

    statValue: {
      fontSize: 28,
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

    addButton: {
      height: 48,
      borderRadius: 16,
      border: "1px solid rgba(229,9,20,0.35)",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "0 18px",
      fontWeight: 800,
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      boxShadow: "0 12px 30px rgba(229,9,20,0.22)",
    },

    card: {
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      overflow: "hidden",
    },

    cardHeader: {
      padding: 18,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    cardTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
    },

    cardSub: {
      fontSize: 13,
      color: "rgba(255,255,255,0.45)",
      marginTop: 6,
    },

    pillWrap: {
      padding: 18,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
    },

    pill: (color) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 999,
      background: `${color}18`,
      border: `1px solid ${color}33`,
      color,
      fontSize: 13,
      fontWeight: 700,
    }),

    pillDelete: (color) => ({
      width: 22,
      height: 22,
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      color,
      opacity: 0.75,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      padding: 0,
    }),

    tableWrap: {
      width: "100%",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 720,
    },

    th: {
      textAlign: "left",
      padding: "14px 18px",
      fontSize: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.45)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },

    td: {
      padding: "16px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      color: "#fff",
      fontSize: 14,
      verticalAlign: "middle",
    },

    previewBadge: (color) => ({
      display: "inline-flex",
      padding: "6px 12px",
      borderRadius: 999,
      background: `${color}18`,
      border: `1px solid ${color}33`,
      color,
      fontSize: 12,
      fontWeight: 700,
    }),

    deleteBtn: {
      height: 38,
      borderRadius: 12,
      border: "1px solid rgba(229,9,20,0.22)",
      background: "rgba(229,9,20,0.12)",
      color: "#f87171",
      padding: "0 14px",
      fontWeight: 700,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    },

    empty: {
      padding: 34,
      textAlign: "center",
      color: "rgba(255,255,255,0.48)",
    },

    modalBody: {
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    label: {
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      fontWeight: 600,
    },

    input: {
      height: 48,
      borderRadius: 14,
      padding: "0 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
    },

    error: {
      fontSize: 13,
      color: "#f87171",
      fontWeight: 600,
    },

    helper: {
      fontSize: 12,
      color: "rgba(255,255,255,0.42)",
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
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Total Genres</div>
              <div style={styles.statValue}>{totalGenres}</div>
            </div>
            <div style={styles.statIcon}>
              <Tags size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Filtered Results</div>
              <div style={styles.statValue}>{filteredCount}</div>
            </div>
            <div style={styles.statIcon}>
              <Search size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Color Variants</div>
              <div style={styles.statValue}>{uniqueColors}</div>
            </div>
            <div style={styles.statIcon}>
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} color="rgba(255,255,255,0.45)" />
          <input
            style={styles.searchInput}
            placeholder="Search genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          style={styles.addButton}
          onClick={() => {
            setModal(true);
            setError("");
          }}
        >
          <Plus size={16} />
          Add Genre
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Genre Pills</h3>
            <div style={styles.cardSub}>
              Quick visual overview of all available categories.
            </div>
          </div>
        </div>

        {filteredGenres.length === 0 ? (
          <div style={styles.empty}>No genres found.</div>
        ) : (
          <div style={styles.pillWrap}>
            {filteredGenres.map((genre) => {
              const originalIndex = genres.findIndex((g) => g === genre);
              const color = COLORS[originalIndex % COLORS.length];

              return (
                <div key={`${genre}-${originalIndex}`} style={styles.pill(color)}>
                  <span>{genre}</span>
                  <button
                    style={styles.pillDelete(color)}
                    onClick={() => removeGenre(originalIndex)}
                    title="Delete genre"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Genre List</h3>
            <div style={styles.cardSub}>
              Organized table view for easier management.
            </div>
          </div>
        </div>

        {filteredGenres.length === 0 ? (
          <div style={styles.empty}>No genres available.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Genre Name</th>
                  <th style={styles.th}>Preview</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGenres.map((genre, i) => {
                  const originalIndex = genres.findIndex((g) => g === genre);
                  const color = COLORS[originalIndex % COLORS.length];

                  return (
                    <tr key={`row-${genre}-${originalIndex}`}>
                      <td style={{ ...styles.td, color: "rgba(255,255,255,0.35)", width: 60 }}>
                        {i + 1}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{genre}</td>
                      <td style={styles.td}>
                        <span style={styles.previewBadge(color)}>{genre}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => removeGenre(originalIndex)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title="Add Genre"
          onClose={() => {
            setModal(false);
            setVal("");
            setError("");
          }}
        >
          <div style={styles.modalBody}>
            <label style={styles.label}>Genre Name</label>
            <input
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="e.g. Horror, Romance, Mystery..."
              style={styles.input}
              autoFocus
            />

            {error ? <div style={styles.error}>{error}</div> : null}

            <div style={styles.helper}>
              Add clear and reusable category names for movies and series.
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button
              onClick={() => {
                setModal(false);
                setVal("");
                setError("");
              }}
              style={styles.ghostBtn}
            >
              Cancel
            </button>
            <button onClick={save} style={styles.primaryBtn}>
              <CheckCircle2 size={14} />
              Save Genre
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}