import React from "react";

const TutorAvatar: React.FC = () => (
  <div className="avatar-container" draggable={false}>
    <img
      src="/tutor.png"
      alt="Dino Avatar"
      className="avatar-img"
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        objectFit: "cover",
        userSelect: "none",
        pointerEvents: "none"  // wichtig: blockiert Events auf dem Bild selbst!
      }}
    />
    <style jsx>{`
      .avatar-container {
        display: inline-block;
        border-radius: 50%;
        overflow: hidden;
        cursor: grab;
      }
      .avatar-container:active {
        cursor: grabbing;
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

export default TutorAvatar;