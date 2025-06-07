import React, { useState, useRef } from "react";

// Die drei fixen Positionen am rechten Rand (oben, mitte, unten)
const positions = [
  { name: "top",    style: { top: 32,   right: 32 } },
  { name: "middle", style: { top: "50%", right: 32, transform: "translateY(-50%)" } },
  { name: "bottom", style: { bottom: 32, right: 32 } },
];

// Hilfsfunktion: ermittelt die nächste Ziel-Position basierend auf der Maus-y-Position
function getClosestPosition(clientY: number, windowHeight: number) {
  const yTargets = [
    32, // top
    windowHeight / 2,
    windowHeight - 32, // bottom
  ];
  const diffs = yTargets.map((y) => Math.abs(clientY - y));
  const minIdx = diffs.indexOf(Math.min(...diffs));
  return positions[minIdx];
}

const DraggableDinoWidget: React.FC = () => {
  // Standardmäßig: unten rechts
  const [dockPosition, setDockPosition] = useState(positions[2]); // bottom
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Für das freie Dragging: aktuelle Koordinaten
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  // Drag-Start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // Widget-Position relativ zum Mouse-Click merken
    const rect = widgetRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    });
    // Bei Drag sofort auf absolute Werte wechseln
    setDragPos({
      x: e.clientX - (rect?.left ?? 0) + (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0) + (rect?.top ?? 0),
    });
    // Während Drag absolute Positionierung nutzen
    document.body.style.userSelect = "none"; // Textauswahl verhindern
  };

  // Mouse move (nur während Drag)
  React.useEffect(() => {
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

      // Docking: Nächstgelegene Position suchen
      const closest = getClosestPosition(e.clientY, window.innerHeight);
      setDockPosition(closest);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line
  }, [isDragging, dragOffset]);

  // Widget-Style abhängig von Dragging
  let style: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "all 0.25s cubic-bezier(.4,2,.6,1)",
    // Während Drag absolute Position, sonst an Dock-Position
    ...(isDragging
      ? { left: dragPos.x, top: dragPos.y }
      : dockPosition.style),
  };

  // Simpler Chat-Toggle
  const [open, setOpen] = useState(false);

  return (
    <div ref={widgetRef} style={style}>
      {/* Dino-Button (Drag-Handle) */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          border: "2px solid #e0e0e0",
          userSelect: "none",
        }}
        title="Dino Tutor – zum Verschieben anklicken und ziehen"
      >
        <img
          src="/dino.png"
          alt="Dino"
          style={{
            width: 40,
            height: 40,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {/* Chat-Badge */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 6,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#81d4fa",
            border: "2px solid #fff",
            display: open ? "none" : "block",
          }}
        />
      </div>
      {/* Chat-Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 0,
            minWidth: 280,
            maxWidth: 320,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: 16,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              border: "none",
              background: "transparent",
              fontSize: 16,
              cursor: "pointer",
              color: "#888",
            }}
            aria-label="Chat schließen"
          >
            ×
          </button>
          {/* Hier kann dein Chat eingebettet werden */}
          <div style={{ marginTop: 24 }}>
            <b>Willkommen bei Meitrex!</b>
            <p>Hier kannst du mit dem Dino-Chat interagieren.</p>
            {/* ... dein Chat-Komponente hier einbinden ... */}
          </div>
        </div>
      )}
      {/* Chat öffnen */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "absolute",
            left: 56 + 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#81d4fa",
            color: "#222",
            border: "none",
            borderRadius: 16,
            padding: "6px 14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(128,128,128,0.10)",
            zIndex: 20,
          }}
        >
          Chat öffnen
        </button>
      )}
    </div>
  );
};

export default DraggableDinoWidget;