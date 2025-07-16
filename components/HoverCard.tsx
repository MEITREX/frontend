import React, { ReactNode, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type HoverCardProps = {
  children: ReactNode;
  card: ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  cardStyle?: React.CSSProperties;
};

export function HoverCard({
  children,
  card,
  position = "bottom",
  cardStyle,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [open]);

  let popupStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 9999,
    ...cardStyle,
  };
  if (coords) {
    if (position === "bottom") {
      popupStyle.top = coords.top + coords.height + 10;
      popupStyle.left = coords.left + coords.width / 2;
      popupStyle.transform = "translateX(-50%)";
    } else if (position === "top") {
      popupStyle.top = coords.top - 10;
      popupStyle.left = coords.left + coords.width / 2;
      popupStyle.transform = "translate(-50%, -100%)";
    } else if (position === "left") {
      popupStyle.top = coords.top + coords.height / 2;
      popupStyle.left = coords.left - 10;
      popupStyle.transform = "translate(-100%, -50%)";
    } else if (position === "right") {
      popupStyle.top = coords.top + coords.height / 2;
      popupStyle.left = coords.left + coords.width + 10;
      popupStyle.transform = "translateY(-50%)";
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        style={{ display: "inline-block", position: "relative" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        tabIndex={0}
      >
        {children}
      </div>
      {open &&
        coords &&
        createPortal(
          <div
            style={{
              ...popupStyle,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 8px 32px 0 rgba(40,40,50,0.21)",
              padding: 16,
              minWidth: 220,
              textAlign: "center",
              pointerEvents: "auto",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onClick={(e) => e.stopPropagation()}
          >
            {card}
          </div>,
          document.body
        )}
    </>
  );
}
