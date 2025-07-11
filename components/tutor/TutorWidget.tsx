import React, { useState, useRef, useEffect } from "react";
import TutorAvatar from "./TutorAvatar";
import TutorChat from "./TutorChat";

const AVATAR_WIDTH = 60;
const CHAT_WIDTH = 500;

const positions = [
  { name: "top", style: { top: 32, right: 32 } },
  {
    name: "center",
    style: { top: "50%", right: 32, transform: "translateY(-50%)" },
  },
  { name: "bottom", style: { bottom: 32, right: 32 } },
] as const;

function getClosestPosition(
  clientY: number,
  windowHeight: number
): (typeof positions)[number] {
  const yTargets = [
    32, // top
    windowHeight / 2,
    windowHeight - 32, // bottom
  ];
  const diffs = yTargets.map((y) => Math.abs(clientY - y));
  const minIdx = diffs.indexOf(Math.min(...diffs));
  return positions[minIdx];
}

type Recommendation = {
  id: string;
  text: string;
};
type TutorWidgetProps = {
  isAuthenticated: boolean;
};

export default function TutorWidget({ isAuthenticated }: TutorWidgetProps) {
  const [dockPosition, setDockPosition] = useState<(typeof positions)[number]>(
    positions[2]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [mouseDownPosition, setMouseDownPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  // API call for recommendations (on mount)
  useEffect(() => {
    fetch("/api/graphql", {
      // Pfad anpassen
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            recommendations {
              id
              text
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.recommendations) {
          setRecommendations(res.data.recommendations);
        }
      })
      .catch(() => {});
  }, []);

  // Welcome Bubble auto-hide timer
  useEffect(() => {
    if (!showWelcome) return;
    const timeout = setTimeout(() => setShowWelcome(false), 8000);
    return () => clearTimeout(timeout);
  }, [showWelcome]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    const rect = widgetRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    });
    setDragPos({
      x: e.clientX - (rect?.left ?? 0) + (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0) + (rect?.top ?? 0),
    });
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setDragPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      const closest = getClosestPosition(e.clientY, window.innerHeight);
      setDockPosition(closest);
      if (
        mouseDownPosition &&
        Math.abs(mouseDownPosition.x - e.clientX) < 5 &&
        Math.abs(mouseDownPosition.y - e.clientY) < 5
      ) {
        setOpen((v) => !v);
      }
      setMouseDownPosition(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, mouseDownPosition]);

  let style: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
    backgroundColor: "#fff",
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "all 0.25s cubic-bezier(.4,2,.6,1)",
    ...(isDragging ? { left: dragPos.x, top: dragPos.y } : dockPosition.style),
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: dockPosition.name === "bottom" ? "flex-end" : "flex-start",
    width: open ? CHAT_WIDTH + AVATAR_WIDTH : AVATAR_WIDTH,
    pointerEvents: "auto",
  };

  const recommendationBubbleStyle: React.CSSProperties = {
    position: "absolute",
    right: AVATAR_WIDTH + 4,
    bottom: open ? 60 : 48,
    maxWidth: 260,
    background: "#fff",
    color: "#222",
    borderRadius: 18,
    boxShadow: "0 2px 16px rgba(80,80,80,0.13)",
    padding: "14px 16px 14px 14px",
    zIndex: 10001,
    fontSize: 15,
    lineHeight: 1.5,
    display: "flex",
    alignItems: "center",
    animation: "bubbleIn 0.4s cubic-bezier(.4,2,.6,1)",
    minWidth: 0,
  };

  const bubbleArrowStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    right: -12,
    bottom: 16,
    width: 0,
    height: 0,
    borderTop: "10px solid transparent",
    borderBottom: "10px solid transparent",
    borderLeft: "12px solid #fff",
    filter: "drop-shadow(0 1px 3px rgba(80,80,80,0.10))",
  };

  function clearRecommendations() {
    setRecommendations([]);
  }

  function handleCloseWelcome() {
    setShowWelcome(false);
  }

  return (
    <div ref={widgetRef} style={style}>
      {/* Recommendation/Welcome Bubble */}
      {(showWelcome || recommendations.length > 0) && (
        <div
          style={{
            ...recommendationBubbleStyle,
            pointerEvents: "auto",
            top: undefined,
          }}
          tabIndex={-1}
        >
          <span style={bubbleArrowStyle as any}></span>
          {showWelcome ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <span style={{ flex: 1 }}>
                Hallo, willkommen bei Meitrex!
                <br />
                Falls du Fragen hast, meld dich einfach!
              </span>
              <button
                onClick={handleCloseWelcome}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  fontSize: 20,
                  marginLeft: 8,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                  alignSelf: "flex-start",
                }}
                aria-label="Willkommensnachricht schließen"
                title="Willkommensnachricht schließen"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 200,
                overflowY: "auto",
                minWidth: 0,
              }}
            >
              {recommendations.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    wordBreak: "break-word",
                  }}
                >
                  <span style={{ flex: 1 }}>{r.text}</span>
                  <button
                    onClick={() =>
                      setRecommendations((old) =>
                        old.filter((x) => x.id !== r.id)
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      fontSize: 20,
                      marginLeft: 8,
                      cursor: "pointer",
                      lineHeight: 1,
                      padding: 0,
                      alignSelf: "flex-start",
                    }}
                    aria-label="Empfehlung schließen"
                    title="Empfehlung schließen"
                  >
                    ×
                  </button>
                </div>
              ))}
              {recommendations.length > 1 && (
                <button
                  onClick={clearRecommendations}
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-end",
                    color: "#888",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  aria-label="Alle Empfehlungen schließen"
                  title="Alle Empfehlungen schließen"
                >
                  Alle schließen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Avatar (Dino), Drag-Handle und Button in einem */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "relative",
          zIndex: 2,
          marginRight: 0,
          marginLeft: open ? 8 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: AVATAR_WIDTH,
          minWidth: AVATAR_WIDTH,
          maxWidth: AVATAR_WIDTH,
        }}
        title="Dino Tutor – zum Verschieben oder Öffnen klicken"
      >
        <button
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            boxShadow: open
              ? "0 2px 8px rgba(80,80,80,0.15)"
              : "0 1px 4px rgba(80,80,80,0.13)",
            borderRadius: "50%",
            transition: "box-shadow 0.15s",
            width: AVATAR_WIDTH,
            height: AVATAR_WIDTH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={open ? "Tutor einklappen" : "Tutor öffnen"}
        >
          <TutorAvatar />
        </button>
      </div>
      {/* Chat-Blase, nach links aufklappend */}
      {open && (
        <div
          style={{
            background: "#fff",
            borderRadius: "18px 18px 0 18px",
            border: "0.5px solid lightgrey",
            boxShadow: "0 4px 24px rgba(80,80,80,0.13)",
            padding: "16px 12px 12px 16px",
            minWidth: CHAT_WIDTH - 40,
            maxWidth: CHAT_WIDTH,
            marginRight: 0,
            marginLeft: 0,
            marginBottom: 7,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            zIndex: 1,
          }}
        >
          <TutorChat />
        </div>
      )}
    </div>
  );
}
