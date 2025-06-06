import React from "react";
import styles from "./TutorAvatar.module.css";

const TutorAvatar: React.FC = () => (
  <div
    style={{
      width: 64,
      height: 64,
      backgroundColor: "#81d4fa", // 
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}
  >
    <img
      //src="/DinoTutor.png"
      src="/logo.svg"
      alt="AI Tutor Dino"
      className={styles.avatar}
      style={{
        width: "80%",
        height: "80%",
        objectFit: "contain",
      }}
    />
  </div>
);

export default TutorAvatar;