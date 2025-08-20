import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

type Rarity = "common" | "uncommon" | "rare" | "ultra_rare";

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
  publicProfil: boolean
};

const rarityColors: Record<string, { border: string; bg: string }> = {
  common: { border: "#26a0f5", bg: "#e3f2fd" }, // blue
  uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
  rare: { border: "#8e44ad", bg: "#f3e5f5" }, // purpule
  ultra_rare: { border: "#e53935", bg: "#ffebee" }, // red
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
  publicProfil
}) => {
  const isBuyMode = typeof equipped === "number";
  const colors = rarityColors[rarity] ?? rarityColors.common;

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
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Price:</strong> {equipped} DP
              </Typography>
            )}
            {/* Show rarity of the item */}
            <Typography variant="body2">
              <strong>Rarity:</strong>{" "}
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Button where item can be equipped or unequipped in the inventory. In the shop item can be bought if user has enough currency */}
      {publicProfil === false && (<DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onToggleEquip}
          variant="contained"
          disabled={
            (isBuyMode && unspentPoints < equipped) ||
            (!isBuyMode && category === "tutors" && equipped)
          }
        >
          {isBuyMode
            ? unspentPoints < equipped
              ? "Not enough DP"
              : `Buy for ${equipped} DP`
            : category === "tutors" && equipped
            ? "Tutor can not be unequipped. Equip other tutor to unequip this one"
            : equipped
            ? "Unequip"
            : "Equip"}
        </Button>
      </DialogActions>)}
    </Dialog>
  );
};

export default DecorationPopup;
