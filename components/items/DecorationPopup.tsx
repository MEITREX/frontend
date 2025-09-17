import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import coins from "assets/lottery/coins.png";
import Image from "next/image";
import React from "react";
import { Rarity, rarityMap } from "./types/Types";

type Props = {
  open: boolean;
  onClose: () => void;
  imageSrc?: string;
  imageAlt: string;
  description: string;
  /** bool = equip/unequip, number = buy for certain prize (DP) */
  equipped: boolean | number;
  onToggleEquip: () => void;
  name: string;
  rarity?: Rarity;
  backColor?: string;
  foreColor?: string;
  unspentPoints?: number;
  category?: string;
  publicProfil: boolean;
  unlocked?: Boolean;
  obtainableInShop?: Boolean;
};

const DecorationPopup: React.FC<Props> = ({
  open,
  onClose,
  imageSrc,
  imageAlt,
  description,
  equipped,
  onToggleEquip,
  name,
  rarity = "common",
  foreColor = null,
  backColor = null,
  unspentPoints = 0,
  category = null,
  publicProfil,
  unlocked = false,
  obtainableInShop = false,
}) => {
  const isBuyMode = typeof equipped === "number";
  const colors = rarityMap[rarity] ?? rarityMap.common;

  // Define label to dsiplay
  const rarityLabel =
    rarity === "ultra_rare"
      ? "Ultra Rare"
      : rarity?.charAt(0).toUpperCase() + (rarity?.slice(1) ?? "Common");

  const rarityKey = (rarity || "common").toLowerCase().replace(/\s+/g, "");

  return (
    // Dialog to show details for an item in the SHop or Inventory
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          overflow: "hidden",
          border: `3px solid ${colors.border}`,
          borderRadius: 3,
          boxShadow: `0 0 0 3px ${colors.border}33`,
          backgroundColor: colors.bg,
        },
      }}
    >
      {/* Title is the name of the item */}
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        {name}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Picture of the item, has three cases. 1st only picture, 2nd foreground color and background picture, 3rd foreground and background color.
        Profile picture, tutor pictur and profile picture frame are case 1. Case 2 are pattern themes, case 3 are color themes, both are profile backgrounds */}
        <Box sx={{ p: 1 }}>
          {/* Case 1 */}
          {foreColor == null && backColor == null && imageSrc != null && (
            // Border for item display
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
              {/* picture is whole picture */}
              <img
                src={decodeURIComponent(imageSrc)}
                alt={imageAlt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            </Box>
          )}
          {/* Case 2 */}
          {foreColor != null && backColor == null && imageSrc != null && (
            // Border for item display
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
              {/* picture is bigger outside box */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                  overflow: "hidden",
                  backgroundImage: `url(${decodeURIComponent(imageSrc)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* foreground color is bigger middle box */}
                <Box
                  sx={{
                    backgroundColor: foreColor,
                    borderRadius: 2,
                    width: "80%",
                    height: "80%",
                  }}
                />
              </Box>
            </Box>
          )}
          {/* Case 3 */}
          {foreColor != null && backColor != null && (
            // Border for item display
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
              {/* background color is bigger outside box */}
              <Box
                sx={{
                  backgroundColor: backColor,
                  borderRadius: 0,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                  width: "100%",
                  height: "100%",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* foreground color is smaller middle box */}
                <Box
                  sx={{
                    backgroundColor: foreColor, // z. B. theme.palette.secondary.main
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 1.5,
                    width: "80%",
                    height: "80%",
                  }}
                >
                  {/* Inner box mit foreColor */}
                  {}
                </Box>
              </Box>
            </Box>
          )}

          {!unlocked && !isBuyMode && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.95rem",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              Locked, but obtainable in {obtainableInShop ? "Shop" : "Lottery"}
            </Box>
          )}
        </Box>

        {/* Display further information */}
        <Box sx={{ px: 2, pb: 1 }}>
          {/* Description below the item */}
          {description && (
            <Typography variant="body1" sx={{ mb: 1, textAlign: "center" }}>
              {description}
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>
            {/* Show the price if we are in the shop */}
            {isBuyMode && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  marginBottom: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <strong>Price:</strong> {equipped}
                </Typography>
                <Image
                  src={coins}
                  alt="Coins"
                  width={18}
                  height={18}
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
              </Box>
            )}
            {/* Show rarity of the item */}
            {/* Informations about item */}
            <Box
              sx={{

                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">Rarity:</Typography>
              <Chip
                label={rarityLabel.replace("_", " ").toUpperCase()}
                size="small"
                sx={{
                  bgcolor:
                    rarityMap[rarityKey as Rarity].border ?? rarityMap.common,
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  borderRadius: 1,
                  height: 20, // etwas kompakter
                  "& .MuiChip-label": {
                    px: 1.2, // horizontal padding im Label
                    py: 0, // vertikal ausgleichen
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Button where item can be equipped or unequipped in the inventory. In the shop item can be bought if user has enough currency */}
      {publicProfil === false && (
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={onToggleEquip}
            variant="contained"
            disabled={
              (isBuyMode && unspentPoints < equipped) ||
              (!isBuyMode && category === "tutors" && equipped) ||
              (!isBuyMode && equipped && name == "Default Profile Picture") ||
              (!unlocked && !isBuyMode)
            }
          >
            {isBuyMode ? (
              unspentPoints < equipped ? (
                <>
                  Not enough&nbsp;
                  <Image
                    src={coins}
                    alt="Coins"
                    width={16}
                    height={16}
                    style={{ verticalAlign: "middle" }}
                  />
                </>
              ) : (
                <>
                  Buy for {equipped}&nbsp;
                  <Image
                    src={coins}
                    alt="Coins"
                    width={16}
                    height={16}
                    style={{ verticalAlign: "middle" }}
                  />
                </>
              )
            ) : category === "tutors" && equipped ? (
              "Tutor can not be unequipped. Equip other tutor to unequip this one"
            ) : equipped ? (
              name == "Default Profile Picture" ? (
                "Default profile picture can not be unequiped"
              ) : (
                "Unequip"
              )
            ) : (
              "Equip"
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DecorationPopup;
