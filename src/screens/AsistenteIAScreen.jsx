//frontend\src\screens\AsistenteIAScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useKpiContext } from "../hooks/useKpiContext";
import styles from "../styles/screens/AsistenteIA.module.css";
import { chat } from "../services/aiService";

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(iso) {
  return timeFormatter.format(new Date(iso));
}

function extractText(res) {
  return (
    res?.recommendation ?? res?.answer ?? res?.message ?? res?.respuesta ?? null
  );
}

function MessageBubble({ message, userInitials }) {
  const isUser = message.type === "user";
  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.rowUser : styles.rowAi}`}
    >
      {!isUser && (
        <div className={`${styles.avatar} ${styles.aiAvatar}`} aria-hidden>
          <Sparkles size={14} />
        </div>
      )}
      <div className={`${styles.message} ${isUser ? styles.user : styles.ai}`}>
        <div className={styles.messageContent}>{message.content}</div>
        <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
      </div>
      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden>
          {userInitials}
        </div>
      )}
    </div>
  );
}

const WELCOME = {
  id: "welcome",
  type: "ai",
  content:
    "Hola, soy tu asistente de IA. Pregúntame sobre productividad, tareas o sprints.",
  timestamp: new Date().toISOString(),
};

export default function AsistenteIAScreen() {
  const { user } = useAuth();
  const { userId: ctxUserId, sprintId, loading: ctxLoading } = useKpiContext();

  // user.id viene del JWT; ctxUserId es el fallback del contexto de KPIs
  const userId = user?.id ?? ctxUserId;

  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const userInitials =
    user?.initials ||
    `${user?.nombre?.[0] ?? ""}${(user?.apellidos ?? user?.apellidoPaterno ?? "")?.[0] ?? ""}`.toUpperCase() ||
    "U";

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (type, content) =>
    setMessages((prev) => [
      ...prev,
      {
        id: `${type}-${Date.now()}`,
        type,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);

  const sendMessage = async (evt) => {
    evt?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // Validar que tenemos contexto antes de llamar al endpoint
    if (!userId || !sprintId) {
      addMessage(
        "ai",
        "No se pudo identificar tu usuario o sprint activo. Recarga la página e intenta de nuevo.",
      );
      return;
    }

    addMessage("user", text);
    setInput("");
    setSending(true);
    setIsTyping(true);

    try {
      // POST /ai/chat?userId=X&sprintId=Y  con { message }
      const res = await chat(userId, sprintId, text);
      const aiText =
        extractText(res) ??
        "Lo siento, no tengo una respuesta en este momento.";
      addMessage("ai", aiText);
    } catch (err) {
      console.error("AsistenteIA – chat:", err.message);
      addMessage(
        "ai",
        "Error al comunicarse con el servicio IA. Intenta de nuevo más tarde.",
      );
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  // Deshabilitar input mientras carga el contexto (userId / sprintId aún son null)
  const inputDisabled = sending || ctxLoading || !userId || !sprintId;
  const placeholder = ctxLoading
    ? "Cargando contexto del sprint..."
    : !userId || !sprintId
      ? "No hay sprint activo disponible..."
      : "Pregúntame sobre tu productividad, tareas o sprint...";

  return (
    <MainLayout title="Asistente IA">
      <div className={styles.container}>
        <section className={styles.card} aria-label="Asistente de chat con IA">
          <header className={styles.header}>
            <div className={styles.headerIcon} aria-hidden>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className={styles.title}>Asistente IA</h1>
              <p className={styles.subtitle}>
                Recomendaciones y asistencia inteligente para tu gestión de
                proyectos.
              </p>
            </div>
          </header>

          <div className={styles.divider} />

          <div
            className={styles.messages}
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                userInitials={userInitials}
              />
            ))}

            {isTyping && (
              <div className={styles.typingRow}>
                <div
                  className={`${styles.avatar} ${styles.aiAvatar}`}
                  aria-hidden
                >
                  <Sparkles size={14} />
                </div>
                <div className={styles.typingBubble} aria-hidden>
                  <span className={styles.typingLabel}>Escribiendo...</span>
                  <span className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputRow} onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={inputDisabled}
              className={styles.input}
              autoComplete="off"
            />
            <button
              type="submit"
              className={styles.send}
              disabled={inputDisabled || !input.trim()}
              aria-label="Enviar mensaje"
            >
              {sending ? (
                <span className={styles.dotSpinner} aria-hidden>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </section>
      </div>
    </MainLayout>
  );
}
