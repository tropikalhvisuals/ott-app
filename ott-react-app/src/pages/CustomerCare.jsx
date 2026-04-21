import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headset,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Send,
  Clock3,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Search,
  Sparkles,
  BadgeHelp,
  MonitorSmartphone,
  Globe,
  Trash2,
  Save,
  MessagesSquare,
  FileText,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const DRAFT_KEY = "customerCareDraft";

export default function CustomerCare() {
  const userId = localStorage.getItem("userId") || "";
  const userName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    name: userName,
    email: userEmail,
    mobile: "",
    subject: "",
    issueType: "Playback Issue",
    priority: "Medium",
    pageName: "Customer Care",
    movieTitle: "",
    deviceType: "Web",
    appVersion: "1.0.0",
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [faqQuery, setFaqQuery] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [tickets, setTickets] = useState([]);

  const [chatOpen, setChatOpen] = useState(true);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const chatBoxRef = useRef(null);

  const supportCards = [
    {
      title: "Call Support",
      text: "Talk directly with our support team for urgent streaming, login, and account issues.",
      value: "+91 98765 43210",
      action: "tel:+919876543210",
      icon: <Phone size={22} />,
    },
    {
      title: "Email Support",
      text: "Send screenshots and detailed issue information to our support email.",
      value: "support@hflix.com",
      action: "mailto:support@hflix.com",
      icon: <Mail size={22} />,
    },
    {
      title: "Live Chat",
      text: "Chat with customer care for quick help related to playback and account issues.",
      value: "Open Chat",
      action: "chat",
      icon: <MessageCircle size={22} />,
    },
  ];

  const quickTopics = [
    "Login not working",
    "Movie not playing",
    "Trailer loading problem",
    "Buffering issue",
    "Favorite not updating",
    "Subscription problem",
    "Profile details issue",
    "Audio not working",
  ];

  const helpTopics = [
    "Unable to login to account",
    "Movie or trailer not playing",
    "Favorite list not updating",
    "Profile details not showing correctly",
    "Video quality or buffering issue",
    "Payment or subscription support",
  ];

  const faqItems = [
    {
      q: "Movie is not playing",
      a: "Check your internet connection, refresh the page, and verify that the video URL or HLS stream is available.",
    },
    {
      q: "Unable to login",
      a: "Confirm email and password, clear local storage or session, and try signing in again.",
    },
    {
      q: "Video quality is low",
      a: "Check your network speed and make sure adaptive stream or selected quality is available.",
    },
    {
      q: "Favorite list not updating",
      a: "Make sure the item has a valid id and that favorite data is stored correctly in localStorage or database.",
    },
    {
      q: "Trailer not loading",
      a: "Check whether the trailer URL is correct and that the server allows the media file to load.",
    },
    {
      q: "Profile data missing",
      a: "Verify localStorage values and fetch the latest user profile from the backend API.",
    },
  ];

  const filteredFaq = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return faqItems;

    return faqItems.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [faqQuery]);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Draft parse error:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (form.name || form.email || userId) {
      initChatSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, form.name, form.email]);

  useEffect(() => {
    if (!chatSessionId) return;

    let isMounted = true;

    const fetchInitial = async () => {
      if (isMounted) {
        await loadChatMessages(chatSessionId);
      }
    };

    fetchInitial();

    const interval = setInterval(() => {
      if (isMounted) {
        loadChatMessages(chatSessionId);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [chatSessionId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchTickets = async () => {
    try {
      if (!userId) return;

      const res = await fetch(`${API_BASE}/api/customer-care/tickets/${userId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("fetchTickets error:", error);
    }
  };

  const initChatSession = async () => {
    try {
      if (!form.name.trim() && !form.email.trim() && !userId) return;

      const res = await fetch(`${API_BASE}/api/customer-care/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || null,
          name: form.name || "Guest User",
          email: form.email || "",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.session_id) {
        setChatSessionId((prev) => prev || data.session_id);
      } else {
        console.error("Session create failed:", data);
      }
    } catch (error) {
      console.error("initChatSession error:", error);
    }
  };

  const loadChatMessages = async (sessionId) => {
    try {
      if (!sessionId) return;

      setChatLoading(true);

      const res = await fetch(
        `${API_BASE}/api/customer-care/chat/messages/${sessionId}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      } else {
        console.error("Message load failed:", data);
      }
    } catch (error) {
      console.error("loadChatMessages error:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    let currentSessionId = chatSessionId;

    try {
      setSendingChat(true);

      if (!currentSessionId) {
        const res = await fetch(`${API_BASE}/api/customer-care/chat/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId || null,
            name: form.name || "Guest User",
            email: form.email || "",
          }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.session_id) {
          currentSessionId = data.session_id;
          setChatSessionId(data.session_id);
        } else {
          alert("Unable to start chat session");
          return;
        }
      }

      const messageText = chatInput.trim();

      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender_type: "user",
        sender_name: form.name || "User",
        message: messageText,
      };

      setChatMessages((prev) => [...prev, tempMessage]);
      setChatInput("");

      const res = await fetch(`${API_BASE}/api/customer-care/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          sender_type: "user",
          sender_name: form.name || "User",
          message: messageText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await loadChatMessages(currentSessionId);
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("handleSendChat error:", error);
      alert("Failed to send chat message");
    } finally {
      setSendingChat(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.subject.trim()) nextErrors.subject = "Subject is required";

    if (!form.message.trim()) {
      nextErrors.message = "Message is required";
    } else if (form.message.trim().length < 15) {
      nextErrors.message = "Message must be at least 15 characters";
    }

    if (form.mobile && !/^[0-9+\-\s]{8,15}$/.test(form.mobile.trim())) {
      nextErrors.mobile = "Enter a valid mobile number";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Copy failed");
    }
  };

  const handleSupportAction = (item) => {
    if (item.action === "chat") {
      setChatOpen(true);
      return;
    }
    window.location.href = item.action;
  };

  const fillQuickTopic = (topic) => {
    let subject = topic;
    let issueType = "Other";

    if (topic.toLowerCase().includes("login")) issueType = "Login Issue";
    else if (
      topic.toLowerCase().includes("movie") ||
      topic.toLowerCase().includes("trailer") ||
      topic.toLowerCase().includes("buffering") ||
      topic.toLowerCase().includes("audio")
    ) {
      issueType = "Playback Issue";
    } else if (topic.toLowerCase().includes("subscription")) {
      issueType = "Subscription Issue";
    } else if (topic.toLowerCase().includes("favorite")) {
      issueType = "Favorite Issue";
    } else if (topic.toLowerCase().includes("profile")) {
      issueType = "Account Issue";
    }

    setForm((prev) => ({
      ...prev,
      subject,
      issueType,
      message:
        prev.message ||
        `Hi support team,\nI need help with: ${topic}.\nPlease check and resolve this issue.`,
    }));
  };

  const handleAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be below 5 MB");
      return;
    }

    setAttachment(file);
  };

  const handleReset = () => {
    const resetData = {
      name: userName || "",
      email: userEmail || "",
      mobile: "",
      subject: "",
      issueType: "Playback Issue",
      priority: "Medium",
      pageName: "Customer Care",
      movieTitle: "",
      deviceType: "Web",
      appVersion: "1.0.0",
      browser: typeof navigator !== "undefined" ? navigator.userAgent : "",
      message: "",
    };

    setForm(resetData);
    setAttachment(null);
    setErrors({});
    setSubmitSuccess(false);
    setTicketId("");
    localStorage.setItem(DRAFT_KEY, JSON.stringify(resetData));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    alert("Draft saved successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setSubmitSuccess(false);

      const formData = new FormData();
      formData.append("user_id", userId || "");
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);
      formData.append("subject", form.subject);
      formData.append("issue_type", form.issueType);
      formData.append("priority", form.priority);
      formData.append("page_name", form.pageName);
      formData.append("movie_title", form.movieTitle);
      formData.append("device_type", form.deviceType);
      formData.append("app_version", form.appVersion);
      formData.append("browser", form.browser);
      formData.append("message", form.message);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await fetch(`${API_BASE}/api/customer-care/ticket`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTicketId(data.ticket_id);
        setSubmitSuccess(true);

        const resetAfterSubmit = {
          ...form,
          mobile: "",
          subject: "",
          issueType: "Playback Issue",
          priority: "Medium",
          pageName: "Customer Care",
          movieTitle: "",
          message: "",
        };

        setForm(resetAfterSubmit);
        setAttachment(null);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(resetAfterSubmit));
        fetchTickets();
      } else {
        alert(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Customer care submit error:", error);
      alert("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      padding: 24,
      color: "#fff",
      background:
        "radial-gradient(circle at top left, rgba(229,9,20,0.08), transparent 22%), #05070d",
    },
    hero: {
      borderRadius: 24,
      padding: 24,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
    },
    heroTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
      flexWrap: "wrap",
    },
    heroLeft: {
      flex: 1,
      minWidth: 260,
    },
    heroIcon: {
      width: 64,
      height: 64,
      borderRadius: 18,
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.28)",
      color: "#ff4d4f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroTitle: {
      margin: 0,
      color: "#fff",
      fontSize: 30,
      fontWeight: 900,
      lineHeight: 1.1,
    },
    heroDesc: {
      marginTop: 10,
      color: "rgba(255,255,255,0.60)",
      fontSize: 14,
      lineHeight: 1.7,
      maxWidth: 760,
    },
    statusWrap: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
      gap: 14,
      minWidth: 320,
      width: "100%",
      maxWidth: 520,
    },
    statusCard: {
      borderRadius: 18,
      padding: 18,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    },
    statusLabel: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
    },
    statusValue: {
      color: "#fff",
      fontSize: 18,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    statusHelp: {
      color: "rgba(255,255,255,0.48)",
      fontSize: 13,
      lineHeight: 1.6,
    },
    quickRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 16,
    },
    chip: {
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: 999,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 16,
    },
    card: {
      borderRadius: 22,
      padding: 20,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
    },
    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.28)",
      color: "#ff4d4f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    cardTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: 800,
      marginBottom: 8,
    },
    cardText: {
      color: "rgba(255,255,255,0.58)",
      fontSize: 14,
      lineHeight: 1.7,
      marginBottom: 16,
      minHeight: 66,
    },
    cardActions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },
    cardBtn: {
      flex: 1,
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.3fr) minmax(300px, 0.7fr)",
      gap: 18,
    },
    formCard: {
      borderRadius: 22,
      padding: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
    },
    sectionTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    sectionDesc: {
      color: "rgba(255,255,255,0.56)",
      fontSize: 14,
      lineHeight: 1.7,
      marginBottom: 18,
    },
    successBox: {
      marginBottom: 18,
      padding: 16,
      borderRadius: 16,
      border: "1px solid rgba(34,197,94,0.35)",
      background: "rgba(34,197,94,0.10)",
      color: "#d1fae5",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    },
    formGrid: {
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
      color: "rgba(255,255,255,0.68)",
      fontSize: 13,
      fontWeight: 700,
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
      minHeight: 140,
      borderRadius: 14,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
      resize: "vertical",
    },
    error: {
      color: "#fca5a5",
      fontSize: 12,
      fontWeight: 600,
    },
    infoBar: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 12,
      marginBottom: 18,
    },
    infoItem: {
      padding: 14,
      borderRadius: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.7)",
      fontSize: 13,
      lineHeight: 1.6,
    },
    submitRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 18,
    },
    leftActions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },
    submitBtn: {
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
    secondaryBtn: {
      height: 44,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "0 16px",
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    helpCard: {
      borderRadius: 22,
      padding: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    topicList: {
      display: "grid",
      gap: 12,
    },
    topicItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: 14,
      borderRadius: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.68)",
      fontSize: 14,
      lineHeight: 1.6,
    },
    faqSearch: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minHeight: 48,
      borderRadius: 14,
      padding: "0 14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    faqInput: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "#fff",
      fontSize: 14,
    },
    faqItem: {
      padding: 14,
      borderRadius: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    faqQ: {
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 8,
    },
    faqA: {
      fontSize: 13,
      lineHeight: 1.7,
      color: "rgba(255,255,255,0.65)",
    },
    chatCard: {
      borderRadius: 22,
      padding: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
    },
    chatBox: {
      height: 320,
      overflowY: "auto",
      borderRadius: 16,
      padding: 14,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 14,
    },
    chatBubbleUser: {
      alignSelf: "flex-end",
      maxWidth: "80%",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "14px 14px 4px 14px",
      fontSize: 13,
      lineHeight: 1.6,
    },
    chatBubbleSupport: {
      alignSelf: "flex-start",
      maxWidth: "80%",
      background: "rgba(255,255,255,0.07)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "14px 14px 14px 4px",
      fontSize: 13,
      lineHeight: 1.6,
    },
    chatInputRow: {
      display: "flex",
      gap: 10,
    },
    chatInput: {
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
    ticketCard: {
      borderRadius: 16,
      padding: 14,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 10,
    },
    ticketTitle: {
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 6,
    },
    ticketMeta: {
      fontSize: 12,
      color: "rgba(255,255,255,0.62)",
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroTop}>
          <div style={styles.heroLeft}>
            <div style={styles.heroIcon}>
              <Headset size={28} />
            </div>

            <h2 style={styles.heroTitle}>Advanced Customer Care</h2>

            <div style={styles.heroDesc}>
              Need help with login, playback, subscription, favorites, profile,
              account settings, or video issues? Use the support form or live
              chat below. All submitted tickets and chat messages are stored in
              DB.
            </div>

            <div style={styles.quickRow}>
              {quickTopics.map((topic) => (
                <button
                  key={topic}
                  style={styles.chip}
                  onClick={() => fillQuickTopic(topic)}
                  type="button"
                >
                  <Sparkles size={14} />
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.statusWrap}>
            <div style={styles.statusCard}>
              <div style={styles.statusLabel}>Support Status</div>
              <div style={styles.statusValue}>
                <Clock3 size={18} />
                Online 9 AM - 9 PM
              </div>
              <div style={styles.statusHelp}>
                Average response time is usually within 15 to 30 minutes during
                working hours.
              </div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusLabel}>Ticket Priority</div>
              <div style={styles.statusValue}>
                <AlertCircle size={18} />
                Low / Medium / High
              </div>
              <div style={styles.statusHelp}>
                Add exact movie title and page name for faster resolution.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {supportCards.map((item) => (
          <div key={item.title} style={styles.card}>
            <div style={styles.cardIcon}>{item.icon}</div>
            <div style={styles.cardTitle}>{item.title}</div>
            <div style={styles.cardText}>{item.text}</div>

            <div style={styles.cardActions}>
              <button
                type="button"
                style={styles.cardBtn}
                onClick={() => handleSupportAction(item)}
              >
                {item.value}
              </button>

              {item.action !== "chat" && (
                <button
                  type="button"
                  style={styles.cardBtn}
                  onClick={() => handleCopy(item.value)}
                >
                  <Copy size={16} />
                  {copiedText === item.value ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.formCard}>
          <div style={styles.sectionTitle}>
            <Send size={20} />
            Submit a Support Request
          </div>

          <div style={styles.sectionDesc}>
            Fill in the issue details below. This form stores all data in MySQL.
          </div>

          {submitSuccess && (
            <div style={styles.successBox}>
              <CheckCircle2 size={22} color="#22c55e" />
              <div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>
                  Request submitted successfully
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  Your ticket ID is <strong>{ticketId}</strong>.
                </div>
              </div>
            </div>
          )}

          <div style={styles.infoBar}>
            <div style={styles.infoItem}>
              <MonitorSmartphone size={16} style={{ marginBottom: 8 }} />
              <div>
                <strong>Device</strong>
              </div>
              <div>{form.deviceType}</div>
            </div>

            <div style={styles.infoItem}>
              <Globe size={16} style={{ marginBottom: 8 }} />
              <div>
                <strong>App Version</strong>
              </div>
              <div>{form.appVersion}</div>
            </div>

            <div style={styles.infoItem}>
              <BadgeHelp size={16} style={{ marginBottom: 8 }} />
              <div>
                <strong>Draft</strong>
              </div>
              <div>Auto-saved locally</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
                {errors.name && <span style={styles.error}>{errors.name}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span style={styles.error}>{errors.email}</span>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Mobile Number</label>
                <input
                  style={styles.input}
                  value={form.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  placeholder="Enter mobile number"
                />
                {errors.mobile && (
                  <span style={styles.error}>{errors.mobile}</span>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Issue Type</label>
                <select
                  style={styles.input}
                  value={form.issueType}
                  onChange={(e) => handleChange("issueType", e.target.value)}
                >
                  <option style={{ background: "#111" }} value="Playback Issue">
                    Playback Issue
                  </option>
                  <option style={{ background: "#111" }} value="Login Issue">
                    Login Issue
                  </option>
                  <option
                    style={{ background: "#111" }}
                    value="Subscription Issue"
                  >
                    Subscription Issue
                  </option>
                  <option style={{ background: "#111" }} value="Account Issue">
                    Account Issue
                  </option>
                  <option style={{ background: "#111" }} value="Favorite Issue">
                    Favorite Issue
                  </option>
                  <option style={{ background: "#111" }} value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select
                  style={styles.input}
                  value={form.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                >
                  <option style={{ background: "#111" }} value="Low">
                    Low
                  </option>
                  <option style={{ background: "#111" }} value="Medium">
                    Medium
                  </option>
                  <option style={{ background: "#111" }} value="High">
                    High
                  </option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Page Name</label>
                <input
                  style={styles.input}
                  value={form.pageName}
                  onChange={(e) => handleChange("pageName", e.target.value)}
                  placeholder="Example: Player Page"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Movie / Trailer Title</label>
                <input
                  style={styles.input}
                  value={form.movieTitle}
                  onChange={(e) => handleChange("movieTitle", e.target.value)}
                  placeholder="Enter movie or trailer title"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <input
                  style={styles.input}
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Enter issue subject"
                />
                {errors.subject && (
                  <span style={styles.error}>{errors.subject}</span>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Device Type</label>
                <select
                  style={styles.input}
                  value={form.deviceType}
                  onChange={(e) => handleChange("deviceType", e.target.value)}
                >
                  <option style={{ background: "#111" }} value="Web">
                    Web
                  </option>
                  <option style={{ background: "#111" }} value="Android">
                    Android
                  </option>
                  <option style={{ background: "#111" }} value="iOS">
                    iOS
                  </option>
                  <option style={{ background: "#111" }} value="Smart TV">
                    Smart TV
                  </option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>App Version</label>
                <input
                  style={styles.input}
                  value={form.appVersion}
                  onChange={(e) => handleChange("appVersion", e.target.value)}
                  placeholder="App version"
                />
              </div>

              <div style={{ ...styles.field, ...styles.full }}>
                <label style={styles.label}>Browser / Device Info</label>
                <input
                  style={styles.input}
                  value={form.browser}
                  onChange={(e) => handleChange("browser", e.target.value)}
                  placeholder="Browser or device info"
                />
              </div>

              <div style={{ ...styles.field, ...styles.full }}>
                <label style={styles.label}>Message</label>
                <textarea
                  style={styles.textarea}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Describe your issue in detail"
                />
                {errors.message && (
                  <span style={styles.error}>{errors.message}</span>
                )}
              </div>

              <div style={{ ...styles.field, ...styles.full }}>
                <label style={styles.label}>Upload Screenshot / File</label>
                <input
                  type="file"
                  style={styles.input}
                  accept="image/*,.pdf,.txt"
                  onChange={handleAttachment}
                />
                {attachment && (
                  <span
                    style={{ color: "rgba(255,255,255,0.70)", fontSize: 13 }}
                  >
                    Selected file: {attachment.name}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.submitRow}>
              <div style={styles.leftActions}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={handleSaveDraft}
                >
                  <Save size={16} />
                  Save Draft
                </button>

                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={handleReset}
                >
                  <Trash2 size={16} />
                  Reset
                </button>

                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => window.location.reload()}
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
                
              <button type="submit" style={styles.submitBtn} disabled={submitting}>
                <Send size={16} />
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.helpCard}>
          <div style={styles.sectionTitle}>
            <BadgeHelp size={20} />
            Help Center
          </div>

          <div style={styles.sectionDesc}>
            Search FAQs and common support topics before submitting a request.
          </div>

          <div style={styles.faqSearch}>
            <Search size={16} color="#94a3b8" />
            <input
              style={styles.faqInput}
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search help topics..."
            />
          </div>

          <div style={styles.topicList}>
            {helpTopics.map((topic) => (
              <div key={topic} style={styles.topicItem}>
                <ShieldCheck
                  size={18}
                  color="#22c55e"
                  style={{ marginTop: 2 }}
                />
                <span>{topic}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {filteredFaq.map((item) => (
              <div key={item.q} style={styles.faqItem}>
                <div style={styles.faqQ}>{item.q}</div>
                <div style={styles.faqA}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.chatCard}>
          <div style={styles.sectionTitle}>
            <MessagesSquare size={20} />
            Live Chat
          </div>

          <div style={styles.sectionDesc}>
            Chat with support. Every message is stored in DB.
          </div>

          {chatOpen && (
            <>
              <div style={styles.chatBox} ref={chatBoxRef}>
                {chatLoading ? (
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>
                    Loading chat...
                  </div>
                ) : chatMessages.length ? (
                  chatMessages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      style={
                        msg.sender_type === "user"
                          ? styles.chatBubbleUser
                          : styles.chatBubbleSupport
                      }
                    >
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {msg.sender_name ||
                          (msg.sender_type === "user" ? "You" : "Support")}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>
                    No messages yet. Start the chat.
                  </div>
                )}
              </div>

              <div style={styles.chatInputRow}>
                <input
                  style={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                />
                <button
                  type="button"
                  style={styles.submitBtn}
                  onClick={handleSendChat}
                  disabled={sendingChat}
                >
                  <Send size={16} />
                  {sendingChat ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={styles.helpCard}>
          <div style={styles.sectionTitle}>
            <FileText size={20} />
            My Tickets
          </div>

          <div style={styles.sectionDesc}>
            Your submitted support requests from database.
          </div>

          <div>
            {tickets.length ? (
              tickets.map((ticket) => (
                <div key={ticket.id} style={styles.ticketCard}>
                  <div style={styles.ticketTitle}>
                    {ticket.subject} ({ticket.ticket_id})
                  </div>
                  <div style={styles.ticketMeta}>
                    Type: {ticket.issue_type} <br />
                    Priority: {ticket.priority} <br />
                    Status: {ticket.status} <br />
                    Movie: {ticket.movie_title || "-"} <br />
                    Created: {ticket.created_at}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "rgba(255,255,255,0.6)" }}>
                No tickets found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}