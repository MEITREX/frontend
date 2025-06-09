import React from "react";

/**
 * RecommendationBubble erscheint über dem Dino-Avatar und zeigt einen beliebigen Hinweistext.
 * Die Positionierung erfolgt absolut, damit sie auch außerhalb des Chatfensters sichtbar ist.
 */

// Backend oder Frontend einfach window.setRecommendation("Hier ist eine neue Empfehlung!")

const RecommendationBubble: React.FC<{ text: string; visible?: boolean }> = ({
  text,
  visible = true,
}) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 52, // Abstand rechts vom Dino
        top: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        pointerEvents: "none", // Klicks gehen "hindurch"
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#f0f4c3",
          borderRadius: 16,
          padding: "10px 16px",
          maxWidth: 290,
          fontSize: 15,
          boxShadow: "0 2px 8px rgba(128,128,128,0.08)",
          color: "#333",
          marginLeft: 8,
        }}
      >
        {text}
        {/* Sprechblasen-Dreieck */}
        <div
          style={{
            position: "absolute",
            left: -14,
            top: 20,
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderRight: "14px solid #f0f4c3",
            borderBottom: "8px solid transparent",
          }}
        />
      </div>
    </div>
  );
};

export default RecommendationBubble;
