import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MessageCircle,
  Headset,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Send,
  UserRound,
  Mail,
  Phone,
  RefreshCcw,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

function Badge({ value }) {
  const map = {
    Open: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)", color: "#f59e0b" },
    "In Progress": { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.28)", color: "#3b82f6" },
    Closed: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.28)", color: "#22c55e" },
    High: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.28)", color: "#ef4444" },
    Medium: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)", color: "#f59e0b" },
    Low: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.28)", color: "#22c55e" },
  };

  const style = map[value] || {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    color: "#ddd",
  };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

export default function AdminCustomerCarePage() {
  const [tickets, setTickets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [ticketQuery, setTicketQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSession?.id) return;

    fetchMessages(selectedSession.id);

    const timer = setInterval(() => {
      fetchMessages(selectedSession.id);
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedSession]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/customer-care/tickets`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("fetchTickets error:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/customer-care/chat/sessions`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("fetchSessions error:", err);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`${API_BASE}/api/customer-care/chat/messages/${sessionId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedSession?.id || !replyText.trim()) return;

    try {
      setSending(true);

      const res = await fetch(`${API_BASE}/api/customer-care/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: selectedSession.id,
          sender_type: "support",
          sender_name: "Admin Support",
          message: replyText.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReplyText("");
        fetchMessages(selectedSession.id);
      } else {
        alert(data.message || "Failed to send reply");
      }
    } catch (err) {
      console.error("handleSendReply error:", err);
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/customer-care/ticket-status/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => ({ ...prev, status }));
        }
      } else {
        alert(data.message || "Failed to update ticket status");
      }
    } catch (err) {
      console.error("updateTicketStatus error:", err);
      alert("Failed to update ticket status");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const text =
        `${ticket.ticket_id} ${ticket.name} ${ticket.email} ${ticket.subject} ${ticket.issue_type} ${ticket.status}`.toLowerCase();
      const matchQuery = text.includes(ticketQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || ticket.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [tickets, ticketQuery, statusFilter]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((item) => {
      const text = `${item.name || ""} ${item.email || ""} ${item.status || ""}`.toLowerCase();
      return text.includes(chatQuery.toLowerCase());
    });
  }, [sessions, chatQuery]);

  const openSession = (session) => {
    setSelectedSession(session);
    fetchMessages(session.id);
  };

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === "Open").length,
    inProgressTickets: tickets.filter((t) => t.status === "In Progress").length,
    closedTickets: tickets.filter((t) => t.status === "Closed").length,
  };

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
      color: "#fff",
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

    grid: {
      display: "grid",
      gridTemplateColumns: "1.1fr 0.9fr",
      gap: 18,
      alignItems: "start",
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

    toolbar: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      width: "100%",
    },

    searchWrap: {
      minWidth: 240,
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 46,
      borderRadius: 14,
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

    ticketList: {
      display: "grid",
      gap: 12,
      padding: 18,
      maxHeight: 520,
      overflowY: "auto",
    },

    ticketItem: {
      borderRadius: 18,
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer",
    },

    ticketTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 10,
    },

    ticketTitle: {
      fontSize: 15,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 6,
    },

    ticketMeta: {
      fontSize: 12,
      color: "rgba(255,255,255,0.55)",
      lineHeight: 1.7,
    },

    smallBtn: {
      height: 36,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "0 12px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12,
    },

    detailsCard: {
      padding: 18,
      display: "grid",
      gap: 14,
    },

    detailBox: {
      borderRadius: 18,
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    },

    label: {
      fontSize: 12,
      color: "rgba(255,255,255,0.5)",
      marginBottom: 6,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".06em",
    },

    value: {
      fontSize: 14,
      color: "#fff",
      lineHeight: 1.7,
      wordBreak: "break-word",
    },

    sessionList: {
      display: "grid",
      gap: 12,
      padding: 18,
      maxHeight: 220,
      overflowY: "auto",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },

    sessionItem: {
      borderRadius: 16,
      padding: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer",
    },

    chatBody: {
      padding: 18,
      display: "grid",
      gap: 14,
    },

    chatBox: {
      height: 260,
      overflowY: "auto",
      borderRadius: 16,
      padding: 14,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },

    chatBubbleUser: {
      alignSelf: "flex-start",
      maxWidth: "82%",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "14px 14px 14px 4px",
      fontSize: 13,
      lineHeight: 1.6,
    },

    chatBubbleSupport: {
      alignSelf: "flex-end",
      maxWidth: "82%",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "14px 14px 4px 14px",
      fontSize: 13,
      lineHeight: 1.6,
    },

    replyRow: {
      display: "flex",
      gap: 10,
    },

    replyInput: {
      flex: 1,
      minHeight: 48,
      borderRadius: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
    },

    sendBtn: {
      height: 48,
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

    empty: {
      padding: 20,
      textAlign: "center",
      color: "rgba(255,255,255,0.5)",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Total Tickets</div>
              <div style={styles.statValue}>{stats.totalTickets}</div>
            </div>
            <div style={styles.statIcon}>
              <Headset size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Open</div>
              <div style={styles.statValue}>{stats.openTickets}</div>
            </div>
            <div style={styles.statIcon}>
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>In Progress</div>
              <div style={styles.statValue}>{stats.inProgressTickets}</div>
            </div>
            <div style={styles.statIcon}>
              <Clock3 size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Closed</div>
              <div style={styles.statValue}>{stats.closedTickets}</div>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Customer Queries</h3>
              <div style={styles.cardSub}>
                All support tickets submitted by users.
              </div>
            </div>

            <div style={styles.toolbar}>
              <div style={styles.searchWrap}>
                <Search size={16} color="rgba(255,255,255,0.45)" />
                <input
                  style={styles.searchInput}
                  placeholder="Search ticket, name, email, subject..."
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                />
              </div>

              <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option style={{ background: "#111" }} value="All">All Status</option>
                <option style={{ background: "#111" }} value="Open">Open</option>
                <option style={{ background: "#111" }} value="In Progress">In Progress</option>
                <option style={{ background: "#111" }} value="Closed">Closed</option>
              </select>

              <button style={styles.smallBtn} onClick={fetchTickets}>
                <RefreshCcw size={14} style={{ marginRight: 6 }} />
                Refresh
              </button>
            </div>
          </div>

          <div style={styles.ticketList}>
            {filteredTickets.length ? (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={styles.ticketItem}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div style={styles.ticketTop}>
                    <div>
                      <div style={styles.ticketTitle}>{ticket.subject}</div>
                      <div style={styles.ticketMeta}>
                        Ticket: {ticket.ticket_id}<br />
                        User: {ticket.name} ({ticket.email})<br />
                        Type: {ticket.issue_type}
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <Badge value={ticket.status} />
                      <Badge value={ticket.priority} />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.7,
                    }}
                  >
                    {ticket.message?.slice(0, 120)}
                    {ticket.message?.length > 120 ? "..." : ""}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.empty}>No customer queries found.</div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Ticket Details</h3>
              <div style={styles.cardSub}>
                Selected customer query full details.
              </div>
            </div>
          </div>

          <div style={styles.detailsCard}>
            {selectedTicket ? (
              <>
                <div style={styles.detailBox}>
                  <div style={styles.label}>Subject</div>
                  <div style={styles.value}>{selectedTicket.subject}</div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.label}>Customer</div>
                  <div style={styles.value}>
                    <div>
                      <UserRound size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      {selectedTicket.name}
                    </div>
                    <div>
                      <Mail size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      {selectedTicket.email}
                    </div>
                    <div>
                      <Phone size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      {selectedTicket.mobile || "-"}
                    </div>
                  </div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.label}>Issue Details</div>
                  <div style={styles.value}>
                    Ticket ID: {selectedTicket.ticket_id}<br />
                    Issue Type: {selectedTicket.issue_type}<br />
                    Priority: {selectedTicket.priority}<br />
                    Page: {selectedTicket.page_name || "-"}<br />
                    Movie: {selectedTicket.movie_title || "-"}<br />
                    Device: {selectedTicket.device_type || "-"}<br />
                    App Version: {selectedTicket.app_version || "-"}<br />
                    Status: {selectedTicket.status}
                  </div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.label}>Message</div>
                  <div style={styles.value}>{selectedTicket.message}</div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    style={styles.smallBtn}
                    onClick={() => updateTicketStatus(selectedTicket.id, "Open")}
                  >
                    Open
                  </button>
                  <button
                    style={styles.smallBtn}
                    onClick={() =>
                      updateTicketStatus(selectedTicket.id, "In Progress")
                    }
                  >
                    In Progress
                  </button>
                  <button
                    style={styles.smallBtn}
                    onClick={() => updateTicketStatus(selectedTicket.id, "Closed")}
                  >
                    Closed
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.empty}>Select a ticket to view details.</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Live Chat Sessions</h3>
              <div style={styles.cardSub}>
                User chat sessions and customer conversations.
              </div>
            </div>

            <div style={styles.toolbar}>
              <div style={styles.searchWrap}>
                <Search size={16} color="rgba(255,255,255,0.45)" />
                <input
                  style={styles.searchInput}
                  placeholder="Search name or email..."
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                />
              </div>

              <button style={styles.smallBtn} onClick={fetchSessions}>
                <RefreshCcw size={14} style={{ marginRight: 6 }} />
                Refresh
              </button>
            </div>
          </div>

          <div style={styles.sessionList}>
            {filteredSessions.length ? (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  style={styles.sessionItem}
                  onClick={() => openSession(session)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#fff" }}>
                      {session.name || "Guest User"}
                    </div>
                    <Badge value={session.status || "Open"} />
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: 1.7,
                    }}
                  >
                    {session.email || "-"}<br />
                    Session ID: {session.id}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.empty}>No chat sessions found.</div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Admin Chat Reply</h3>
              <div style={styles.cardSub}>
                Open a session and reply to customer queries.
              </div>
            </div>
          </div>

          <div style={styles.chatBody}>
            <div style={styles.chatBox}>
              {loadingMessages ? (
                <div style={styles.empty}>Loading messages...</div>
              ) : selectedSession ? (
                messages.length ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={
                        msg.sender_type === "support"
                          ? styles.chatBubbleSupport
                          : styles.chatBubbleUser
                      }
                    >
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>
                        {msg.sender_name || msg.sender_type}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={styles.empty}>No messages in this chat yet.</div>
                )
              ) : (
                <div style={styles.empty}>
                  Select a chat session to view messages.
                </div>
              )}
            </div>

            <div style={styles.replyRow}>
              <input
                style={styles.replyInput}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type admin reply..."
                disabled={!selectedSession}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendReply();
                }}
              />
              <button
                style={styles.sendBtn}
                onClick={handleSendReply}
                disabled={!selectedSession || sending}
              >
                <Send size={16} />
                {sending ? "Sending..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}