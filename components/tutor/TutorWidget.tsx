import React, { useState, useRef, useEffect } from "react";
import TutorAvatar from "./tutorAvatar";
import TutorChat from "./TutorChat";

// Drei feste Dock-Positionen am rechten Rand
const positions = [
  { name: "top", style: { top: 32, right: 32 } },
  {
    name: "center",
    style: { top: "50%", right: 32, transform: "translateY(-50%)" },
  },
  { name: "bottom", style: { bottom: 32, right: 32 } },
] as const;

type TutorPosition = (typeof positions)[number]["name"];

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

export type Recommendation = {
  id: string;
  text: string;
};

export type TutorWidgetApi = {
  showRecommendation: (rec: Recommendation) => void;
  clearRecommendations: () => void;
};

let widgetApi: TutorWidgetApi | null = null;

export function showTutorRecommendation(rec: Recommendation) {
  if (widgetApi) widgetApi.showRecommendation(rec);
}

export function clearTutorRecommendations() {
  if (widgetApi) widgetApi.clearRecommendations();
}

type TutorWidgetProps = {
  isAuthenticated: boolean;
};

const WELCOME_KEY = "meitrex-welcome-shown";

const TutorWidget: React.FC<TutorWidgetProps> = ({ isAuthenticated }) => {
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

  // Recommendation Bubble Logic

  /* Recommendations API Logic
import { showTutorRecommendation, clearTutorRecommendations } from "@/components/tutor/TutorWidget";

// Zeige eine Empfehlung:
showTutorRecommendation({ id: "empfehlung-1", text: "Teste die neue Quiz-Funktion!" });

// Empfehlungen wieder schließen:
clearTutorRecommendations();

*/

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // Welcome nur beim Login und nur, wenn er noch nicht angezeigt wurde
  useEffect(() => {
    if (!isAuthenticated) return;
    const alreadyShown = window.localStorage.getItem(WELCOME_KEY);
    if (!alreadyShown) {
      setShowWelcome(true);
      window.localStorage.setItem(WELCOME_KEY, "true");
    }
  }, [isAuthenticated]);

  // Welcome-Bubble nach 8s automatisch ausblenden
  useEffect(() => {
    let timeout: any;
    if (showWelcome) {
      timeout = setTimeout(() => setShowWelcome(false), 8000);
    }
    return () => clearTimeout(timeout);
  }, [showWelcome]);

  // API-Objekt bereitstellen
  useEffect(() => {
    widgetApi = {
      showRecommendation: (rec: Recommendation) => {
        setShowWelcome(false); // Welcome ggf. ausblenden
        setRecommendations((old) => [
          ...old.filter((r) => r.id !== rec.id),
          rec,
        ]);
      },
      clearRecommendations: () => {
        setRecommendations([]);
      },
    };
    return () => {
      widgetApi = null;
    };
  }, []);

  // Drag & Drop
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

      // Klick vs Drag unterscheiden:
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
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "all 0.25s cubic-bezier(.4,2,.6,1)",
    ...(isDragging ? { left: dragPos.x, top: dragPos.y } : dockPosition.style),
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    width: open ? 370 : 60,
    pointerEvents: "auto",
  };

  // Sprechblase soll über dem Avatar erscheinen
  const recommendationBubbleStyle: React.CSSProperties = {
    position: "absolute",
    right: 64,
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
  };

  // Sprechblasen-Pfeil CSS
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

  return (
    <div ref={widgetRef} style={style}>
      {/* Recommendation Bubble (auch für Welcome) */}
      {(showWelcome || recommendations.length > 0) && (
        <div
          style={{
            ...recommendationBubbleStyle,
            pointerEvents: "auto",
            top: undefined, // wird von bottom gesteuert
          }}
          tabIndex={-1}
        >
          {/* Pfeil */}
          <span style={bubbleArrowStyle as any}></span>
          <span>
            {showWelcome ? (
              <>
                Hallo, willkommen bei Meitrex!
                <br />
                Falls du Fragen hast, meld dich einfach!
              </>
            ) : (
              recommendations.map((r) => <span key={r.id}>{r.text}</span>)
            )}
          </span>
          {!showWelcome && recommendations.length > 0 && (
            <button
              onClick={() => setRecommendations([])}
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
            borderRadius: "18px 0 18px 18px",
            boxShadow: "0 4px 24px rgba(80,80,80,0.13)",
            padding: "16px 12px 12px 16px",
            minWidth: 270,
            maxWidth: 320,
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
};

export default TutorWidget;
