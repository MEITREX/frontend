import React, { useState } from "react";
import TutorAvatar from "./TutorAvatar";
import TutorChat from "./TutorChat";

const TutorWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: 24,
      zIndex: 1000
    }}>
      {open ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TutorAvatar />
            <button onClick={() => setOpen(false)} aria-label="Schließen">✖️</button>
          </div>
          <TutorChat />
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ background: "none", border: "none" }} aria-label="Tutor öffnen">
          <TutorAvatar />
        </button>
      )}
    </div>
  );
};

export default TutorWidget;