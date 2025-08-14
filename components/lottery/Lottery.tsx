"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Typography, Button, IconButton } from "@mui/material";
import Confetti from "react-confetti";
import CloseIcon from "@mui/icons-material/Close";

import frame_1 from "../../assets/lottery/animation/frame_1.png";
import frame_2 from "../../assets/lottery/animation/frame_2.png";
import frame_3 from "../../assets/lottery/animation/frame_3.png";
import frame_4 from "../../assets/lottery/animation/frame_4.png";
import frame_5 from "../../assets/lottery/animation/frame_5.png";
import frame_6 from "../../assets/lottery/animation/frame_6.png";
import frame_7 from "../../assets/lottery/animation/frame_7.png";
import frame_8 from "../../assets/lottery/animation/frame_8.png";
import frame_9 from "../../assets/lottery/animation/frame_9.png";
import frame_10 from "../../assets/lottery/animation/frame_10.png";
import frame_11 from "../../assets/lottery/animation/frame_11.png";
import frame_12 from "../../assets/lottery/animation/frame_12.png";

import coins from "../../assets/lottery/coins.png";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useLazyLoadQuery, useMutation } from "react-relay";
import {
  lotteryApiLotteryEquipItemMutation,
  lotteryApiLotteryRunMutation,
  lotteryApiUserInventoryQuery,
} from "@/components/lottery/api/LotteryApi";
import { LotteryApiUserInventoryQuery } from "@/__generated__/LotteryApiUserInventoryQuery.graphql";
import { LotteryApiLotteryRunMutation } from "@/__generated__/LotteryApiLotteryRunMutation.graphql";
import { LotteryApiLotteryEquipItemMutation } from "@/__generated__/LotteryApiLotteryEquipItemMutation.graphql";

type Rarity = "DEFAULT" | "COMMON" | "UNCOMMON" | "RARE" | "ULTRA_RARE";

interface RarityStyle {
  border: string;
  background: string;
}

const rarityStyles: Record<Rarity, RarityStyle> = {
  DEFAULT: {
    border: "2px solid #B0B0B0",
    background: "linear-gradient(to bottom right, #f5f5f5, #e0e0e0)",
  },
  COMMON: {
    border: "2px solid #26a0f5",
    background: "#e3f2fd",
  },
  UNCOMMON: {
    border: "2px solid #d4af37",
    background: "#fff8e1",
  },
  RARE: {
    border: "2px solid #8e44ad",
    background: "#f3e5f5",
  },
  ULTRA_RARE: {
    border: "2px solid #e53935",
    background: "#ffebee",
  },
};

export interface LotteryRun {
  id: string;
  name: string;
  description: string;
  rarity: string;
  foreColor: string | null;
  backColor: string | null;
  url: string | null;
  filename: string | null;
  sold: boolean;
  sellCompensation: number;
}

export default function Lottery() {
  const inventory = useLazyLoadQuery<LotteryApiUserInventoryQuery>(
    lotteryApiUserInventoryQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const [runLottery] = useMutation<LotteryApiLotteryRunMutation>(
    lotteryApiLotteryRunMutation
  );

  const [equipNewItem] = useMutation<LotteryApiLotteryEquipItemMutation>(
    lotteryApiLotteryEquipItemMutation
  );

  // Audio
  const [mute, setMute] = useState(false);
  const crackSound = new Audio("/sounds/egg-crack.mp3");
  const sparkle = new Audio("/sounds/sparkle.mp3");

  // Dino Points
  const [dinoPoints, setDinoPoints] = useState<number>(1000);
  // EggCost needs to be the same as in the Backend
  const eggCost = 3000;

  // Animation Frames
  const frames = [
    frame_1,
    frame_2,
    frame_3,
    frame_4,
    frame_5,
    frame_6,
    frame_7,
    frame_8,
    frame_9,
    frame_10,
    frame_11,
    frame_12,
  ];
  const crackingFrame = 6;
  const startCrackingSoundFrame = 1;

  // Animation
  const [isOpening, setIsOpening] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isEggWobbling, setIsEggWobbling] = useState(true);
  const [showItem, setShowItem] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [rarity, setRarity] = useState<Rarity>("ULTRA_RARE");

  // Item
  const [item, setItem] = useState<any>(null);
  const [equip, setEquip] = useState<boolean>(false);

  useEffect(() => {
    if (inventory?.inventoryForUser?.unspentPoints != null) {
      setDinoPoints(inventory.inventoryForUser.unspentPoints);
    }
  }, [inventory]);

  // This useEffect is needed for the animation loop
  useEffect(() => {
    if (!isOpening) return;

    // The falling animation should be faster; therefore, the frame duration should be shorter after the crack.
    const frameDurations = [
      400,
      400,
      400,
      400,
      400,
      150,
      50, // Crack
      50,
      50,
      50,
      50,
      50,
    ];

    let frameIndex = 0;

    const playFrames = () => {
      setCurrentFrame(frameIndex);

      // The crack sound is 2,000 ms long, so start a little later to synchronise the sound with the crack animation.
      if (frameIndex === startCrackingSoundFrame && !mute) {
        crackSound.play();
      }

      if (frameIndex < frames.length - 1) {
        setTimeout(() => {
          frameIndex++;
          playFrames();
        }, frameDurations[frameIndex]);
      } else {
        // Opening is done
        setShowItem(true);
        if (rarity === "RARE" || rarity === "ULTRA_RARE") {
          mute ? "" : sparkle.play();
          setCelebrate(true);
        }
      }
    };

    playFrames();

    return () => {};
  }, [isOpening]);

  const handleOpenEgg = () => {
    if (dinoPoints < eggCost || isOpening) return;
    runLottery({
      variables: {},
      onCompleted(item) {
        // Start animation
        setRarity(item.lotteryRun?.rarity! as Rarity);
        setDinoPoints((prev) => prev - eggCost);
        setIsEggWobbling(false);
        setIsOpening(true);

        // Set item to display
        setItem(item);
      },
      onError(error) {
        console.error("Lottery failed", error);
      },
    });
  };

  const equipItem = () => {
    equipNewItem({
      variables: { itemId: item.lotteryRun.id },
      onCompleted() {
        setEquip(true);
      },
      onError(error) {
        console.error("Lottery failed", error);
      },
    });
  };

  const handleCloseItem = () => {
    setCelebrate(false);
    setShowItem(false);
    setIsEggWobbling(true);
    setIsOpening(false);
    setCurrentFrame(0);
    setEquip(false);
    item.lotteryRun.sellCompensation
      ? setDinoPoints(dinoPoints + item.lotteryRun.sellCompensation)
      : "";
  };

  return (
    <Box
      p={4}
      textAlign="center"
      sx={{
        position: "relative",
        "@keyframes eggWobble": {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
          "75%": { transform: "rotate(-5deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "@keyframes eggWobbleBounce": {
          "0%": { transform: "rotate(0deg) translateY(0)" },
          "15%": { transform: "rotate(-5deg) translateY(-35px)" },
          "30%": { transform: "rotate(5deg) translateY(0px)" },
          "45%": { transform: "rotate(-4deg) translateY(-20px)" },
          "60%": { transform: "rotate(4deg) translateY(0px)" },
          "75%": { transform: "rotate(-12deg) translateY(-10px)" },
          "90%": { transform: "rotate(12deg) translateY(0px)" },
          "100%": { transform: "rotate(0deg) translateY(0px)" },
        },
        "@keyframes popItem": {
          "0%": {
            transform: "translate(-50%, -50%) scale(0.05)",
            opacity: 0,
          },
          "10%": {
            transform: "translate(-50%, -65%) scale(0.15)",
            opacity: 0.3,
          },
          "20%": {
            transform: "translate(-50%, -75%) scale(0.3)",
            opacity: 0.6,
          },
          "30%": {
            transform: "translate(-50%, -85%) scale(0.45)",
            opacity: 0.8,
          },
          "40%": {
            transform: "translate(-50%, -90%) scale(0.55)",
            opacity: 1,
          },
          "50%": {
            transform: "translate(-50%, -100%) scale(0.65)",
            opacity: 1,
          },
          "60%": {
            transform: "translate(-50%, -110%) scale(0.75)",
            opacity: 1,
          },
          "70%": {
            transform: "translate(-50%, -120%) scale(0.85)",
            opacity: 1,
          },
          "85%": {
            transform: "translate(-50%, -140%) scale(0.95)",
            opacity: 1,
          },
          "100%": {
            transform: "translate(-50%, -160%) scale(1)",
            opacity: 1,
          },
        },
      }}
    >
      <Button sx={{ mb: "78px" }} variant="contained" color="secondary">
        <Box
          component="span"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        >
          {dinoPoints}
          <Image src={coins} alt="Coins" width={18} height={18} />
        </Box>
      </Button>

      {/* Confetti for rare items */}
      {celebrate && (
        <Box
          sx={{
            position: "absolute",
            top: "calc(50% + 20px)",
            left: "50%",
            width: 600,
            height: 600,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          <Confetti
            colors={[
              rarity === "RARE"
                ? "#8e44ad"
                : rarity === "ULTRA_RARE"
                ? "#e53935"
                : "",
            ]}
            width={600}
            height={600}
            numberOfPieces={300}
            recycle={false}
            confettiSource={{ x: 300, y: 315, w: 20, h: 20 }}
          />
        </Box>
      )}

      {/* Egg */}
      <Box
        sx={{
          position: "relative",
          width: 150,
          height: 120,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          transformOrigin: "bottom center",
          animation:
            isOpening && currentFrame < frames.length - crackingFrame
              ? "eggWobbleBounce 0.6s ease-in-out infinite"
              : isEggWobbling
              ? "eggWobble 0.6s ease-in-out infinite"
              : "none",
          zIndex: 2,
        }}
      >
        <Image
          src={frames[currentFrame]}
          alt={`Frame ${currentFrame}`}
          width={150}
          height={120}
          style={{
            objectFit: "contain",
            transform: "scale(1.9) translate(30px, -10px)",
            zIndex: 1,
          }}
        />
      </Box>

      {/* Jumping items contains lottery item */}
      {showItem && (
        <Box
          sx={{
            position: "absolute",
            top: "calc(50% + 50px)",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0)",
            animation: "popItem 1.3s ease-out forwards",
            zIndex: 3,
            width: 200,
            height: 180,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1rem",
            gap: 1,
            padding: "4px",
            overflow: "hidden",
            ...rarityStyles[rarity],
          }}
        >
          <Typography
            variant="body2"
            noWrap
            title={item.lotteryRun.name}
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            <strong>{item.lotteryRun.name}</strong>{" "}
            {item.lotteryRun.sold && (
              <span style={{ color: "green", fontWeight: "bold" }}>
                (Owned)
              </span>
            )}
          </Typography>

          <Box
            sx={{
              position: "relative",
              width: 100,
              height: 100,
              border: "3px solid black",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {item.lotteryRun.url ? (
              <Image
                src={item.lotteryRun.url}
                alt={item.lotteryRun.name}
                fill
                style={{ objectFit: "fill" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: item.lotteryRun.backColor || "transparent",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "60%",
                    height: "60%",
                    bgcolor: item.lotteryRun.foreColor || "transparent",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                )
              </Box>
            )}
          </Box>

          <Typography variant="body2">{item.lotteryRun.rarity}</Typography>

          {item.lotteryRun.sold && item.lotteryRun.sellCompensation ? (
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
            >
              <Typography>Sold for</Typography>
              <Typography style={{ color: "green" }}>
                {item.lotteryRun.sellCompensation}
              </Typography>
              <Image src={coins} alt="Coins" width={18} height={18} />
            </Box>
          ) : (
            <Button onClick={equipItem} variant="contained" disabled={equip}>
              Equip
            </Button>
          )}

          <IconButton
            onClick={handleCloseItem}
            size="small"
            sx={{ color: "black", position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Open egg button */}
      <Box mt={8}>
        <Button
          variant="contained"
          color="primary"
          disabled={dinoPoints < eggCost || isOpening}
          onClick={handleOpenEgg}
        >
          <Box
            component="span"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            Open Egg: {eggCost}
            <Image src={coins} alt="Coins" width={18} height={18} />
          </Box>
        </Button>
      </Box>

      {/* Mute Button */}
      {!mute ? (
        <IconButton
          color="primary"
          onClick={() => setMute(true)}
          sx={{
            position: "absolute",
            right: "20px",
            top: "20px",
            width: "60",
            height: "60",
          }}
        >
          <VolumeUpIcon fontSize="large" />
        </IconButton>
      ) : (
        <IconButton
          onClick={() => setMute(false)}
          color="secondary"
          sx={{
            position: "absolute",
            right: "20px",
            top: "20px",
            width: "60",
            height: "60",
          }}
        >
          <VolumeOffIcon fontSize="large" />
        </IconButton>
      )}
    </Box>
  );
}
