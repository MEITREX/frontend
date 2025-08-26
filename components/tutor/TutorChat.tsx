import {
  TutorChatSendMessageMutation,
  TutorChatSendMessageMutation$data,
} from "@/__generated__/TutorChatSendMessageMutation.graphql";
import { MessageSource, useAITutorStore } from "@/stores/aiTutorStore";
import { Link } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { graphql, useMutation } from "react-relay";

dayjs.extend(duration);

// ----------- Globale Konstanten für fixe Strings -----------
const MIN_WAIT_TIME = 800;
const BOT_THINKS_TEXT = "Dino Tutor denkt nach...";
const BOT_ERROR_TEXT =
  "Es gab ein Problem bei der Kommunikation mit dem Tutor.";
const BOT_PLACEHOLDER =
  "Hallo! Ich bin dein Lern-Dino 🦖. Stell mir eine Frage!";

const sendMessageMutation = graphql`
  mutation TutorChatSendMessageMutation($userInput: String!, $courseId: UUID) {
    sendMessage(userInput: $userInput, courseId: $courseId) {
      answer
      sources {
        ... on DocumentSource {
          page
          mediaRecords {
            contents {
              id
              metadata {
                name
                courseId
              }
            }
          }
        }
        ... on VideoSource {
          startTime
          mediaRecords {
            contentIds
          }
        }
      }
    }
  }
`;

export default function TutorChat() {
  const [sendMessage, isInFlight] =
    useMutation<TutorChatSendMessageMutation>(sendMessageMutation);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendTimestamp = useRef<number | null>(null);
  const { courseId } = useParams();

  const currentChat = useAITutorStore((state) => state.currentChat);
  const addMessage = useAITutorStore((state) => state.addMessage);
  const changeLatestMessage = useAITutorStore(
    (state) => state.changeLatestMessage
  );

  // Automatisches Scrollen zum unteren Ende des Chatverlaufs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // Textarea-Auto-Resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  // Hilfsfunktion: Ersetze letzte Bot-Nachricht
  function replaceLoadingMessage(text: string, sources: MessageSource[]) {
    changeLatestMessage({ sender: "bot", text, sources });
    sendTimestamp.current = null;
  }

  function generateLinks(
    sources: TutorChatSendMessageMutation$data["sendMessage"]["sources"]
  ) {
    const urls: MessageSource[] = [];
    if (!sources) return urls;

    sources.forEach((src) => {
      if ("mediaRecords" in src && src.mediaRecords) {
        console.log("Source: ", src);
        src.mediaRecords.forEach((mr) => {
          if (mr.contents) {
            mr.contents.forEach((content) => {
              if (!content || content.metadata.courseId !== courseId) return;
              if (src.page != undefined) {
                urls.push({
                  link: `/courses/${courseId}/media/${content.id}?page=${
                    src.page + 1
                  }`,
                  displayText: `${content.metadata.name} Seite: ${
                    src.page + 1
                  }`,
                });
              } else if (src.startTime != undefined) {
                const readableTime = dayjs
                  .duration(src.startTime ?? 0, "seconds")
                  .format("HH:mm:ss");
                urls.push({
                  link: `/courses/${courseId}/media/${content.id}?videoPosition=${src.startTime}`,
                  displayText: `${content.metadata.name} Zeitstempel: ${readableTime}`,
                });
              }
            });
          }
        });
      }
    });
    return urls;
  }

  // Nachricht senden
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Chatverlauf ergänzen: Nutzerfrage und "Dino denkt nach..."
    addMessage({ sender: "user", text: prompt, sources: [] });
    addMessage({ sender: "bot", text: BOT_THINKS_TEXT, sources: [] });
    setInput("");
    sendTimestamp.current = Date.now();

    sendMessage({
      variables: {
        userInput: prompt,
        courseId: courseId,
      },
      onCompleted: (data) => {
        let urls: MessageSource[] = [];
        if (data?.sendMessage?.sources) {
          urls = generateLinks(data.sendMessage.sources);
        }

        const elapsed = Date.now() - (sendTimestamp.current ?? 0);
        const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

        setTimeout(() => {
          if (data?.sendMessage?.answer) {
            replaceLoadingMessage(data.sendMessage.answer, urls);
          } else {
            replaceLoadingMessage(BOT_ERROR_TEXT, urls);
          }
        }, waitMore);
      },
      onError: () => {
        const elapsed = Date.now() - (sendTimestamp.current ?? 0);
        const waitMore = Math.max(MIN_WAIT_TIME - elapsed, 0);

        setTimeout(() => {
          replaceLoadingMessage(BOT_ERROR_TEXT, []);
        }, waitMore);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isInFlight && input.trim()) {
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
          maxHeight: 350,
          overflowY: "auto",
          marginBottom: 10,
          paddingRight: 5,
        }}
      >
        {currentChat.length === 0 && (
          <div style={{ color: "#aaa", textAlign: "right" }}>
            {BOT_PLACEHOLDER}
          </div>
        )}
        {currentChat.map((msg, idx) => {
          const isThinking =
            isInFlight &&
            idx === currentChat.length - 1 &&
            msg.sender !== "user";
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-start" : "flex-end",
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
                    filter: "drop-shadow(0 1px 4px rgba(80,80,80,0.13))",
                  }}
                />
              )}
              <span
                style={{
                  display: "inline-block",
                  background: msg.sender === "user" ? "#e3f2fd" : "#f0f4c3",
                  borderRadius: 12,
                  padding: "6px 10px",
                  maxWidth: 300,
                  wordBreak: "break-word",
                  textAlign: "left",
                  opacity: isThinking ? 0.7 : 1,
                  fontStyle: isThinking ? "italic" : "normal",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
                {msg.sources.length > 0 && (
                  <>
                    <br />
                    <br /> Quellen: <br />
                    {msg.sources.map((src, i) => (
                      <div key={i}>
                        <Link href={src.link}>
                          [{i + 1}] {src.displayText}
                        </Link>
                      </div>
                    ))}
                  </>
                )}
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
          disabled={isInFlight}
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
          disabled={isInFlight || !input.trim()}
          sx={{
            borderRadius: 4,
            height: 38,
            fontWeight: 600,
            backgroundColor: "#81d4fa",
            color: "#222",
            "&:hover": {
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
