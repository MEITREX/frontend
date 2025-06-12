import React from "react";

export default function TutorAvatar() {
  return (
    <div className="avatar-container" draggable={false}>
      <img
        src="/tutor.png"
        alt="Dino Avatar"
        className="avatar-img"
        style={{
          userSelect: "none",
          pointerEvents: "none", // blockiert Events auf dem Bild selbst!
        }}
      />
      <style jsx>{`
        .avatar-container {
          display: inline-block;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          cursor: grab;
        }
        .avatar-container:active {
          cursor: grabbing;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .avatar-container:hover .avatar-img {
          animation: shake 0.5s;
          animation-iteration-count: 1;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}