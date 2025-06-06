import React, { useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const TutorChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Zeige die Nutzer-Nachricht direkt an
    setChatHistory((prev) => [...prev, { sender: "user", text: prompt }]);
    setInput("");
    setLoading(true);

    try {
      // Sende Prompt an die API
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: data.answer ?? "Fehler oder keine Antwort erhalten." },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Es gab ein Problem bei der Kommunikation mit dem Tutor." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 8,
        minWidth: 280,
        boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        marginTop: 8,
        maxWidth: 340,
      }}
    >
      <div
        style={{
          maxHeight: 200,
          overflowY: "auto",
          marginBottom: 12,
        }}
      >
        {chatHistory.length === 0 && (
          <div style={{ color: "#aaa" }}>
            Hallo! Ich bin dein Lern-Dino 🦖. Wie kann ich dir beim lernen helfen?
          </div>
        )}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "6px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.sender === "user" ? "#e3f2fd" : "#f0f4c3",
                borderRadius: 12,
                padding: "6px 10px",
                maxWidth: 220,
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            Dino denkt nach...
          </div>
        )}
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frage eingeben..."
          style={{
            flex: 1,
            borderRadius: 4,
            border: "1px solid #eee",
            padding: 8,
            outline: "none",
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: "#81d4fa",
            color: "#222",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          Senden
        </button>
      </form>
    </div>
  );
};

export default TutorChat;