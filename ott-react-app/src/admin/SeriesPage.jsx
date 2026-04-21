import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  Tv,
  Star,
  Layers3,
  Eye,
} from "lucide-react";

const STATUS_COLOR = {
  Published: "#10b981",
  Draft: "#f59e0b",
};

const createEmptySeries = () => ({
  title: "",
  genre: "",
  seasons: 1,
  rating: 8.5,
  poster: "",
  status: "Published",
});

function Badge({ value }) {
  const color = STATUS_COLOR[value] || "rgba(255,255,255,0.65)";
  return (
    <span
      style={{
        padding: "7px 12px",
        borderRadius: 999,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.70)",
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
          maxWidth: 680,
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

function Field({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          height: 48,
          borderRadius: 14,
          padding: "0 14px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <select
        {...props}
        style={{
          height: 48,
          borderRadius: 14,
          padding: "0 14px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      >
        {children}
      </select>
    </div>
  );
}

export default function SeriesPage({
  series = [],
  setSeries,
  query = "",
  externalModal,
  onCloseModal,
}) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(createEmptySeries());
  const [localQuery, setLocalQuery] = useState(query);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setLocalQuery(query || "");
  }, [query]);

  useEffect(() => {
    if (externalModal === "series") {
      setModal("series");
      setForm(createEmptySeries());
    }
  }, [externalModal]);

  const filtered = useMemo(() => {
    return series.filter((s) => {
      const text = `${s.title} ${s.genre} ${s.status}`.toLowerCase();
      const matchesQuery = text.includes(localQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [series, localQuery, statusFilter]);

  const totalSeries = series.length;
  const publishedSeries = series.filter((s) => s.status === "Published").length;
  const draftSeries = series.filter((s) => s.status === "Draft").length;
  const avgRating = series.length
    ? (
        series.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        series.length
      ).toFixed(1)
    : "0.0";

  const openAdd = () => {
    setModal("series");
    setForm(createEmptySeries());
  };

  const openEdit = (item) => {
    setModal("series");
    setForm({
      ...item,
      seasons: Number(item.seasons || 1),
      rating: Number(item.rating || 0),
    });
  };

  const close = () => {
    setModal(null);
    setForm(createEmptySeries());
    if (onCloseModal) onCloseModal();
  };

  const save = () => {
    if (!form.title.trim()) {
      alert("Please enter series title.");
      return;
    }

    const payload = {
      ...form,
      seasons: Number(form.seasons) || 1,
      rating: Number(form.rating) || 0,
      status: form.status || "Published",
    };

    if (form.id) {
      setSeries((prev) =>
        prev.map((item) => (item.id === form.id ? { ...item, ...payload } : item))
      );
    } else {
      setSeries((prev) => [
        { ...payload, id: Date.now() },
        ...prev,
      ]);
    }

    close();
  };

  const remove = (id) => {
    const ok = window.confirm("Are you sure you want to delete this series?");
    if (!ok) return;
    setSeries((prev) => prev.filter((item) => item.id !== id));
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
      gap: 12,
      marginBottom: 10,
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

    tableWrap: {
      width: "100%",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 760,
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

    rowMain: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },

    poster: {
      width: 42,
      height: 42,
      borderRadius: 12,
      background:
        "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(255,255,255,0.04))",
      border: "1px solid rgba(56,189,248,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#7dd3fc",
      flexShrink: 0,
    },

    title: {
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },

    sub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.45)",
    },

    actionRow: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end",
    },

    iconBtn: {
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

    deleteBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.22)",
      color: "#f87171",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },

    empty: {
      padding: 34,
      textAlign: "center",
      color: "rgba(255,255,255,0.48)",
    },

    modalBody: {
      padding: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },

    full: {
      gridColumn: "1 / -1",
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
              <div style={styles.statLabel}>Total Series</div>
              <div style={styles.statValue}>{totalSeries}</div>
            </div>
            <div style={styles.statIcon}>
              <Tv size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Published</div>
              <div style={styles.statValue}>{publishedSeries}</div>
            </div>
            <div style={styles.statIcon}>
              <Eye size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Draft</div>
              <div style={styles.statValue}>{draftSeries}</div>
            </div>
            <div style={styles.statIcon}>
              <Layers3 size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Average Rating</div>
              <div style={styles.statValue}>{avgRating}</div>
            </div>
            <div style={styles.statIcon}>
              <Star size={20} />
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
              placeholder="Search series by title, genre or status..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </div>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option style={{ background: "#111" }} value="All">
              All Status
            </option>
            <option style={{ background: "#111" }} value="Published">
              Published
            </option>
            <option style={{ background: "#111" }} value="Draft">
              Draft
            </option>
          </select>
        </div>

        <button style={styles.addButton} onClick={openAdd}>
          <Plus size={16} />
          Add Series
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Series Management</h3>
            <div style={styles.cardSub}>
              Manage series titles, seasons, publishing status, and ratings.
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.empty}>No series found.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Genre</th>
                  <th style={styles.th}>Seasons</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Rating</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <div style={styles.rowMain}>
                        <div style={styles.poster}>
                          <Tv size={18} />
                        </div>
                        <div>
                          <div style={styles.title}>{item.title}</div>
                          <div style={styles.sub}>Series content</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ ...styles.td, color: "rgba(255,255,255,0.72)" }}>
                      {item.genre}
                    </td>

                    <td style={{ ...styles.td, color: "rgba(255,255,255,0.72)" }}>
                      {item.seasons} Season{Number(item.seasons) > 1 ? "s" : ""}
                    </td>

                    <td style={styles.td}>
                      <Badge value={item.status} />
                    </td>

                    <td style={{ ...styles.td, color: "#f59e0b", fontWeight: 700 }}>
                      ★ {item.rating}
                    </td>

                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.actionRow}>
                        <button
                          onClick={() => openEdit(item)}
                          style={styles.iconBtn}
                          title="Edit Series"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => remove(item.id)}
                          style={styles.deleteBtn}
                          title="Delete Series"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === "series" && (
        <Modal title={form.id ? "Edit Series" : "Add Series"} onClose={close}>
          <div style={styles.modalBody}>
            <Field
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Series title"
            />

            <Field
              label="Genre"
              value={form.genre}
              onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
              placeholder="Drama, Sci-Fi..."
            />

            <Field
              label="Seasons"
              type="number"
              min="1"
              value={form.seasons}
              onChange={(e) =>
                setForm((p) => ({ ...p, seasons: e.target.value }))
              }
              placeholder="1"
            />

            <Field
              label="Rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: e.target.value }))
              }
              placeholder="9.0"
            />

            <div style={styles.full}>
              <Field
                label="Poster URL"
                value={form.poster}
                onChange={(e) =>
                  setForm((p) => ({ ...p, poster: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div style={styles.full}>
              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option style={{ background: "#111" }} value="Published">
                  Published
                </option>
                <option style={{ background: "#111" }} value="Draft">
                  Draft
                </option>
              </SelectField>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button onClick={close} style={styles.ghostBtn}>
              Cancel
            </button>
            <button onClick={save} style={styles.primaryBtn}>
              <Save size={14} />
              Save Series
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}