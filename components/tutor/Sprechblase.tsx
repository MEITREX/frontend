import React, { useState, useEffect } from "react";
import RecommendationBubble from "./RecommendationBubble";

const DEFAULT_TEXT =
  "Hallo! Willkommen bei Meitrex, falls du Fragen hast, meld dich einfach!";

const DinoAvatarWithRecommendation: React.FC = () => {
  const [recommendation, setRecommendation] = useState<string | null>(
    DEFAULT_TEXT
  );

  useEffect(() => {
    (window as any).setRecommendation = (text: string | null) =>
      setRecommendation(text);
    return () => {
      delete (window as any).setRecommendation;
    };
  }, []);

  return (
    <div style={{ position: "fixed", left: 32, bottom: 32, zIndex: 1000 }}>
      <img
        src="/dino.png"
        alt="Dino Avatar"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 2px 8px rgba(128,128,128,0.10)",
          border: "2px solid #e0e0e0",
          background: "#fff",
        }}
      />
      <RecommendationBubble
        text={recommendation ?? ""}
        visible={!!recommendation}
      />
    </div>
  );
};

export default DinoAvatarWithRecommendation;
1;
