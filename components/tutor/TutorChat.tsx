import React, { useState, useRef, useEffect } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// ----------- Globale Konstanten für fixe Strings -----------
const MIN_WAIT_TIME = 800;
const BOT_THINKS_TEXT = "Dino Tutor denkt nach...";
const BOT_ERROR_TEXT = "Es gab ein Problem bei der Kommunikation mit dem Tutor.";
const BOT_PLACEHOLDER = "Hallo! Ich bin dein Lern-Dino 🦖. Stell mir eine Frage!";

// ----------- Message-Typ für den Chatverlauf -----------
type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function TutorChat() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendTimestamp = useRef<number | null>(null);

  // Automatisches Scrollen zum unteren Ende des Chatverlaufs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Textarea-Auto-Resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  // Hilfsfunktion: Ersetze letzte Bot-Nachricht
  function replaceLoadingMessage(text: string) {
    setChatHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        sender: "bot",
        text,
      };
      return updated;
    });
    setLoading(false);
    sendTimestamp.current = null; // <- wichtig!
  }

  // Nachricht senden
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Chatverlauf ergänzen: Nutzerfrage und "Dino denkt nach..."
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: prompt },
      { sender: "bot", text: BOT_THINKS_TEXT },
    ]);
    setInput("");
    setLoading(true);
    sendTimestamp.current = Date.now();

    try {
      // GraphQL Mutation via fetch
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation LlmRequest($prompt: String!) {
              llmRequest(prompt: $prompt) {
                answer
                otherField
              }
            }
          `,
          variables: { prompt },
        }),
      });

      const { data, errors } = await response.json();

      const elapsed = Date.now() - (sendTimestamp.current ?? 0);
      const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

      setTimeout(() => {
        if (errors) {
          replaceLoadingMessage(BOT_ERROR_TEXT);
        } else {
          replaceLoadingMessage(data?.llmRequest?.answer ?? "Fehler oder keine Antwort erhalten.");
        }
      }, waitMore);
    } catch (error) {
      const elapsed = Date.now() - (sendTimestamp.current ?? 0);
      const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

      setTimeout(() => {
        replaceLoadingMessage(BOT_ERROR_TEXT);
      }, waitMore);
    }
  };

  // Mit Enter senden, mit Shift+Enter Zeilenumbruch
  // ACHTUNG: Typ MUSS HTMLDivElement sein, da MUI TextField multiline intern einen div verwendet!
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        (document.activeElement as HTMLElement).blur();
        const form = (e.target as HTMLElement).closest("form");
        if (form) (form as HTMLFormElement).requestSubmit();
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Chatverlauf */}
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          marginBottom: 10,
          paddingRight: 5,
        }}
      >
        {chatHistory.length === 0 && (
          <div style={{ color: "#aaa", textAlign: "right" }}>
            {BOT_PLACEHOLDER}
          </div>
        )}
        {chatHistory.map((msg, idx) => {
          const isThinking =
            loading && idx === chatHistory.length - 1 && msg.sender !== "user";
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-start" : "flex-end",
                margin: "6px 0",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-start" : "flex-end",
              }}
            >
              {isThinking && (
                <img
                  src="/DinoTutor.png"
                  alt="Dino denkt nach"
                  style={{
                    width: 70,
                    height: 70,
                    marginBottom: 4,
                    display: "block",
                    marginLeft: "auto",
                    marginRight: 0,
                    filter: "drop-shadow(0 1px 4px rgba(80,80,80,0.13))"
                  }}
                />
              )}
              <span
                style={{
                  display: "inline-block",
                  background: msg.sender === "user" ? "#e3f2fd" : "#f0f4c3",
                  borderRadius: 12,
                  padding: "6px 10px",
                  maxWidth: 200,
                  wordBreak: "break-word",
                  textAlign: msg.sender === "user" ? "left" : "right",
                  opacity: isThinking ? 0.7 : 1,
                  fontStyle: isThinking ? "italic" : "normal",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </span>
            </div>
          );
        })}
        {/* Dummy-Element fürs automatische Scrollen */}
        <div ref={messagesEndRef} />
      </div>
      {/* Eingabefeld und Button */}
      <form
        onSubmit={handleSend}
        style={{ display: "flex", gap: 6, alignItems: "flex-end" }}
      >
        <TextField
          inputRef={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Frage eingeben..."
          disabled={loading}
          multiline
          minRows={1}
          maxRows={4}
          variant="outlined"
          fullWidth
          InputProps={{
            sx: {
              borderRadius: 4,
              fontFamily: "inherit",
              fontSize: 15,
              textAlign: "left",
              padding: "8px",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !input.trim()}
          sx={{
            borderRadius: 4,
            height: 38,
            fontWeight: 600,
            backgroundColor: "#81d4fa",
            color: "#222",
            '&:hover': {
              backgroundColor: "#4fc3f7",
            },
          }}
        >
          Senden
        </Button>
      </form>
    </div>
  );
}