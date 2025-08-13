"use client";

import { Box, Button, IconButton } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

import frame_1 from "../../assets/lottery/animation/frame_1.png";
import frame_10 from "../../assets/lottery/animation/frame_10.png";
import frame_11 from "../../assets/lottery/animation/frame_11.png";
import frame_12 from "../../assets/lottery/animation/frame_12.png";
import frame_2 from "../../assets/lottery/animation/frame_2.png";
import frame_3 from "../../assets/lottery/animation/frame_3.png";
import frame_4 from "../../assets/lottery/animation/frame_4.png";
import frame_5 from "../../assets/lottery/animation/frame_5.png";
import frame_6 from "../../assets/lottery/animation/frame_6.png";
import frame_7 from "../../assets/lottery/animation/frame_7.png";
import frame_8 from "../../assets/lottery/animation/frame_8.png";
import frame_9 from "../../assets/lottery/animation/frame_9.png";

import coins from "../../assets/lottery/coins.png";

import { LotteryApiLotteryRunMutation } from "@/__generated__/LotteryApiLotteryRunMutation.graphql";
import { LotteryApiUserInventoryQuery } from "@/__generated__/LotteryApiUserInventoryQuery.graphql";
import {
  lotteryApiEquipMutation,
  lotteryApiLotteryRunMutation,
  lotteryApiUserInventoryQuery,
} from "@/components/lottery/api/LotteryApi";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useLazyLoadQuery, useMutation } from "react-relay";
import DecorationPopup from "../items/DecorationPopup";

type LotteryItem = {
  id: string;
  backColor: string | null;
  description: string;
  url: string | null;
  foreColor: string | null;
  name: string;
  rarity: string;
};

const rarityStyles: Record<string, { border: string; bg: string }> = {
  common: { border: "#26a0f5", bg: "#e3f2fd" }, // blau
  uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
  rare: { border: "#8e44ad", bg: "#f3e5f5" }, // lila
  ultra_rare: { border: "#e53935", bg: "#ffebee" }, // rot
};

type Rarity = "common" | "uncommon" | "rare" | "ultra_rare";

export default function Lottery() {
  // TODO mark as duplicate when sell compensate
  const inventory = useLazyLoadQuery<LotteryApiUserInventoryQuery>(
    lotteryApiUserInventoryQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const [runLottery] = useMutation<LotteryApiLotteryRunMutation>(
    lotteryApiLotteryRunMutation
  );

  const [equipItem] = useMutation<LotteryApiLotteryRunMutation>(
    lotteryApiEquipMutation
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
  const [rarity, setRarity] = useState<Rarity>("ultra_rare");
  const [selectedItem, setSelectedItem] = useState<LotteryItem | null>(null);

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
        if (rarity === "rare" || rarity === "ultra_rare") {
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
        console.log(item);
        setSelectedItem(item.lotteryRun);
        console.log(selectedItem);
        setRarity(item.lotteryRun?.rarity! as Rarity);
        setDinoPoints((prev) => prev - eggCost);
        setIsEggWobbling(false);
        setIsOpening(true);
      },
      onError(error) {
        console.error("Lottery failed", error);
      },
    });
  };

  const handleEquipItem = () => {
    equipItem({
      variables: {
        itemId: selectedItem?.id,
      },
      onError() {
        console.log("Cant equip item", selectedItem?.id);
        // Popup schließen oder beibehalten
        setSelectedItem(null);
      },
      onCompleted() {
        console.log("Equiped item");
        // Popup schließen oder beibehalten
        setSelectedItem(null);
      },
    });
  };

  const handleCloseItem = () => {
    setCelebrate(false);
    setShowItem(false);
    setIsEggWobbling(true);
    setIsOpening(false);
    setCurrentFrame(0);
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
            colors={[rarityStyles[rarity]?.border]}
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
        {/*Egg*/}
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
      {showItem && selectedItem && (
        <DecorationPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          imageSrc={
            selectedItem.url ? decodeURIComponent(selectedItem.url) : undefined
          }
          imageAlt={selectedItem!.name}
          description={selectedItem!.description || "No description available."}
          equipped={false}
          onToggleEquip={handleEquipItem}
          name={selectedItem!.name}
          rarity={selectedItem!.rarity as Rarity}
          unspentPoints={dinoPoints}
          backColor={selectedItem!.backColor ?? undefined}
          foreColor={selectedItem!.foreColor ?? undefined}
        />
      )}

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
