"use client";

import React, { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type HoverCardProps = {
  children: ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  cardStyle?: React.CSSProperties;
  background: string | null;
  foreground: string;
  nickname: string;
  patternThemeBool: boolean;
  frameBool: boolean;
  frame: string | null;
  profilePic: string;
};

export function HoverCard({
  children,
  position = "bottom",
  cardStyle,
  background,
  foreground,
  nickname,
  patternThemeBool,
  frameBool,
  frame,
  profilePic,
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
              padding: 0,
              minWidth: 220,
              textAlign: "center",
              pointerEvents: "auto",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "relative",
                isolation: "isolate", // erzeugt eigenen Stacking-Context
                overflow: "hidden",
                borderRadius: 8,
                minWidth: 220,
                minHeight: 120,
                background: background ?? "#ffffff",
              }}
            >
              {patternThemeBool && (
                <img
                  src={background ?? "test"}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1, // ganz nach unten
                    pointerEvents: "none", // Hover/Klicks oben bleiben
                  }}
                />
              )}

              {/* optionaler Weiß-Schleier für Lesbarkeit */}
              {/* <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.35)", zIndex: 0 }} /> */}

              {/* Inhalt oben drüber */}

              <div style={{ position: "relative", zIndex: 1, padding: 8 }}>
                <div
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                  }}
                >
                  {/* Rahmen-Bild */}
                  {frameBool && (
                    <img
                      src={decodeURIComponent(frame ?? "Unkown")}
                      alt={nickname}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                        objectFit: "cover",
                        boxShadow: "0 2px 8px #0001",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Profilbild */}
                  <img
                    src={decodeURIComponent(profilePic)}
                    alt={nickname}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                      objectFit: "cover",
                      boxShadow: "0 2px 8px #0001",
                      zIndex: 0,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 4,
                    color: foreground,
                  }}
                >
                  {nickname}
                </div>
                <div style={{ fontSize: 15, color: "#a1a6b2", marginTop: 8 }}>
                  Profilinfos folgen…
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
