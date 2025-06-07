import React, { useState, useRef, useEffect } from "react";

// Mindestzeit, wie lange "Dino Tutor denkt nach..." stehen bleibt (in Millisekunden)
const MIN_WAIT_TIME = 800;

// Message-Typ für den Chatverlauf
type Message = {
  sender: "user" | "bot";
  text: string;
};

const TutorChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendTimestamp = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatisches Scrollen zum unteren Ende des Chatverlaufs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Automatisches Anpassen der textarea-Höhe (Auto-Resize)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  // Nachricht senden
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Chatverlauf ergänzen: Nutzerfrage und "Dino denkt nach..."
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: prompt },
      { sender: "bot", text: "Dino Tutor denkt nach..." },
    ]);
    setInput("");
    setLoading(true);
    sendTimestamp.current = Date.now();

    try {
      // Anfrage an den Bot (API ggf. anpassen!)
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      // Berechne, wie lange die "denkt nach..."-Nachricht schon angezeigt wird
      const elapsed = Date.now() - (sendTimestamp.current ?? 0);
      const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

      // Warte ggf. noch, damit die Nachricht lang genug sichtbar bleibt
      setTimeout(() => {
        setChatHistory((prev) => {
          const updated = [...prev];
          // Ersetze die letzte Bot-Nachricht durch die echte Antwort
          const lastBotIdx = updated.map(m => m.sender).lastIndexOf("bot");
          if (lastBotIdx !== -1) {
            updated[lastBotIdx] = {
              sender: "bot",
              text: data.answer ?? "Fehler oder keine Antwort erhalten.",
            };
          } else {
            updated.push({
              sender: "bot",
              text: data.answer ?? "Fehler oder keine Antwort erhalten.",
            });
          }
          return updated;
        });
        setLoading(false);
        sendTimestamp.current = null; // <- wichtig!
      }, waitMore);

    } catch (error) {
      // Fehlerbehandlung mit Mindestwartezeit
      const elapsed = Date.now() - (sendTimestamp.current ?? 0);
      const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

      setTimeout(() => {
        setChatHistory((prev) => {
          const updated = [...prev];
          const lastBotIdx = updated.map(m => m.sender).lastIndexOf("bot");
          if (lastBotIdx !== -1) {
            updated[lastBotIdx] = {
              sender: "bot",
              text: "Es gab ein Problem bei der Kommunikation mit dem Tutor.",
            };
          } else {
            updated.push({
              sender: "bot",
              text: "Es gab ein Problem bei der Kommunikation mit dem Tutor.",
            });
          }
          return updated;
        });
        setLoading(false);
        sendTimestamp.current = null; // <- wichtig!
      }, waitMore);
    }
  };

  // Optional: Mit Enter senden, mit Shift+Enter Zeilenumbruch
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        (document.activeElement as HTMLElement).blur();
        // Form-Submit explizit auslösen:
        const form = e.currentTarget.closest("form");
        if (form) form.requestSubmit();
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Chatverlauf */}
      <div
        style={{
          maxHeight: 180,
          overflowY: "auto",
          marginBottom: 10,
          width: "100%",
          paddingRight: 2,
        }}
      >
        {chatHistory.length === 0 && (
          <div style={{ color: "#aaa", textAlign: "right" }}>
            Hallo! Ich bin dein Lern-Dino 🦖. Stell mir eine Frage!
          </div>
        )}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-start" : "flex-end",
              margin: "6px 0",
              width: "100%",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.sender === "user" ? "#e3f2fd" : "#f0f4c3",
                borderRadius: 12,
                padding: "6px 10px",
                maxWidth: 200,
                wordBreak: "break-word",
                textAlign: msg.sender === "user" ? "left" : "right",
                opacity: msg.text === "Dino Tutor denkt nach..." ? 0.7 : 1,
                fontStyle: msg.text === "Dino Tutor denkt nach..." ? "italic" : "normal",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {/* Dummy-Element fürs automatische Scrollen */}
        <div ref={messagesEndRef} />
      </div>
      {/* Eingabefeld und Button */}
      <form onSubmit={handleSend} style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Frage eingeben..."
          style={{
            flex: 1,
            borderRadius: 4,
            border: "1px solid #eee",
            padding: 8,
            outline: "none",
            textAlign: "left",
            resize: "none",
            minHeight: 36,
            maxHeight: 90,
            overflowY: "auto",
            fontFamily: "inherit",
            fontSize: 15,
          }}
          disabled={loading}
          rows={1}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: "#81d4fa",
            color: "#222",
            border: "none",
            borderRadius: 4,
            padding: "8px 14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            height: 38,
            fontWeight: 600,
          }}
        >
          Senden
        </button>
      </form>
    </div>
  );
};

export default TutorChat;