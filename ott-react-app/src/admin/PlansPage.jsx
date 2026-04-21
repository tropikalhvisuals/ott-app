import { useMemo, useState } from "react";
import {
  Plus,
  X,
  Check,
  Trash2,
  Crown,
  Search,
  Sparkles,
} from "lucide-react";

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 999,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        borderRadius: 24,
        background: "linear-gradient(180deg,#0f0f14,#09090f)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: "#fff" }}>{title}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PlansPage({ plans = [], setPlans }) {
  const [modal, setModal] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", price: "", features: "" });

  const filteredPlans = useMemo(() => {
    return plans.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [plans, query]);

  const save = () => {
    if (!form.name || !form.price) return;

    const features = form.features
      ? form.features.split(",").map(f => f.trim()).filter(Boolean)
      : [];

    setPlans(p => [
      { id: Date.now(), ...form, features },
      ...p
    ]);

    setForm({ name: "", price: "", features: "" });
    setModal(false);
  };

  const remove = (id) => {
    if (!window.confirm("Delete this plan?")) return;
    setPlans(p => p.filter(x => x.id !== id));
  };

  const styles = {
    page: { display: "flex", flexDirection: "column", gap: 18 },

    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 14,
    },

    statCard: {
      padding: 18,
      borderRadius: 18,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)"
    },

    toolbar: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap"
    },

    search: {
      flex: 1,
      minWidth: 250,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.04)"
    },

    addBtn: {
      background: "#e50914",
      border: "none",
      color: "#fff",
      padding: "12px 16px",
      borderRadius: 14,
      fontWeight: 700,
      cursor: "pointer"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
      gap: 16
    },

    card: {
      padding: 20,
      borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 12
    },

    price: {
      fontSize: 32,
      fontWeight: 900,
      color: "#e50914"
    },

    feature: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13
    },

    deleteBtn: {
      marginTop: "auto",
      padding: "10px",
      borderRadius: 12,
      border: "1px solid rgba(229,9,20,0.3)",
      background: "rgba(229,9,20,0.1)",
      color: "#f87171",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.page}>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div>Total Plans</div>
          <div style={{ fontSize: 24 }}>{plans.length}</div>
        </div>
        <div style={styles.statCard}>
          <div>Premium Plans</div>
          <div style={{ fontSize: 24 }}>
            {plans.filter(p => p.name.toLowerCase().includes("premium")).length}
          </div>
        </div>
        <div style={styles.statCard}>
          <div>Search Results</div>
          <div style={{ fontSize: 24 }}>{filteredPlans.length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.search}>
          <Search size={16} />
          <input
            placeholder="Search plans..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ background: "none", border: "none", color: "#fff", outline: "none" }}
          />
        </div>

        <button style={styles.addBtn} onClick={() => setModal(true)}>
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {filteredPlans.map(plan => {
          const isPremium = plan.name.toLowerCase().includes("premium");

          return (
            <div key={plan.id} style={{
              ...styles.card,
              border: isPremium ? "1px solid #e50914" : styles.card.border
            }}>
              {isPremium && <Crown color="#e50914" />}

              <h3 style={{ color: "#fff" }}>{plan.name}</h3>

              <div style={styles.price}>
                {plan.price}
                <span style={{ fontSize: 12, color: "#aaa" }}>/mo</span>
              </div>

              {plan.features?.map((f, i) => (
                <div key={i} style={styles.feature}>
                  <Check size={14} color="#34d399" />
                  {f}
                </div>
              ))}

              <button style={styles.deleteBtn} onClick={() => remove(plan.id)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title="Add Plan" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Plan Name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
            <input placeholder="Price"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            />
            <input placeholder="Features (comma separated)"
              value={form.features}
              onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
            />

            <button onClick={save} style={styles.addBtn}>
              Save Plan
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}