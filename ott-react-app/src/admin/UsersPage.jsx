import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldX,
  X,
  Mail,
  CalendarDays,
  Users,
} from "lucide-react";

const STATUS_COLOR = {
  Active: "#10b981",
  Blocked: "#ef4444",
};

const ROLE_OPTIONS = ["User", "Premium", "Admin"];
const STATUS_OPTIONS = ["Active", "Blocked"];

const createEmptyUser = () => ({
  name: "",
  email: "",
  role: "User",
  status: "Active",
  joined: new Date().toISOString().slice(0, 10),
});

export default function UsersPage({ users = [], setUsers, query = "" }) {
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [localQuery, setLocalQuery] = useState(query);
  const [form, setForm] = useState(createEmptyUser());

  useEffect(() => {
    setLocalQuery(query || "");
  }, [query]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name} ${user.email} ${user.role} ${user.status}`.toLowerCase();
      const matchesQuery = text.includes(localQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [users, localQuery, statusFilter, roleFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const blockedUsers = users.filter((u) => u.status === "Blocked").length;
  const premiumUsers = users.filter((u) => u.role === "Premium").length;

  const resetForm = () => {
    setForm(createEmptyUser());
    setEditingUser(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "User",
      status: user.status || "Active",
      joined: user.joined || new Date().toISOString().slice(0, 10),
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      alert("Please fill name and email.");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...user, ...form } : user
        )
      );
    } else {
      const newUser = {
        id: Date.now(),
        ...form,
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      )
    );
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
      minWidth: 900,
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

    userCell: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "rgba(229,9,20,0.13)",
      border: "1px solid rgba(229,9,20,0.3)",
      color: "#ff5b5b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      flexShrink: 0,
    },

    name: {
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },

    email: {
      fontSize: 12,
      color: "rgba(255,255,255,0.45)",
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
      width: "fit-content",
    }),

    actionRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
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

    empty: {
      padding: 28,
      textAlign: "center",
      color: "rgba(255,255,255,0.52)",
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
      height: 48,
      borderRadius: 14,
      padding: "0 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
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
  };

  return (
    <div style={styles.page}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Total Users</div>
              <div style={styles.statValue}>{totalUsers}</div>
            </div>
            <div style={styles.statIcon}>
              <Users size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Active Users</div>
              <div style={styles.statValue}>{activeUsers}</div>
            </div>
            <div style={styles.statIcon}>
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Blocked Users</div>
              <div style={styles.statValue}>{blockedUsers}</div>
            </div>
            <div style={styles.statIcon}>
              <ShieldX size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Premium Users</div>
              <div style={styles.statValue}>{premiumUsers}</div>
            </div>
            <div style={styles.statIcon}>
              <Mail size={20} />
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
              placeholder="Search users by name, email, role or status..."
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
            {STATUS_OPTIONS.map((item) => (
              <option key={item} style={{ background: "#111" }} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option style={{ background: "#111" }} value="All">
              All Roles
            </option>
            {ROLE_OPTIONS.map((item) => (
              <option key={item} style={{ background: "#111" }} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button style={styles.addButton} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>User Management</h3>
            <div style={styles.cardSub}>
              Manage accounts, roles, access status, and joined dates.
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={styles.empty}>No users found.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.name}>{user.name}</div>
                          <div style={styles.email}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.badge("#60a5fa")}>{user.role}</div>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={styles.badge(
                          STATUS_COLOR[user.status] || "#999999"
                        )}
                      >
                        {user.status}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        <CalendarDays size={15} />
                        {user.joined}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <button
                          style={styles.iconBtn}
                          title="Edit User"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          style={styles.iconBtn}
                          title="Toggle Status"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === "Active" ? (
                            <ShieldX size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </button>

                        <button
                          style={styles.iconBtn}
                          title="Delete User"
                          onClick={() => handleDelete(user.id)}
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

      {openModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button style={styles.iconBtn} onClick={handleCloseModal}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                <div style={{ ...styles.field, ...styles.full }}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div style={{ ...styles.field, ...styles.full }}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    style={styles.input}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email"
                    type="email"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Role</label>
                  <select
                    style={styles.input}
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                  >
                    {ROLE_OPTIONS.map((item) => (
                      <option key={item} style={{ background: "#111" }} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item} style={{ background: "#111" }} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ ...styles.field, ...styles.full }}>
                  <label style={styles.label}>Joined Date</label>
                  <input
                    style={styles.input}
                    value={form.joined}
                    onChange={(e) => handleChange("joined", e.target.value)}
                    type="date"
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.ghostBtn}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}