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
  imageSrc: string;
  imageAlt: string;
  description: string;
  /** bool = equip/unequip, number = kaufen für Preis (DP) */
  equipped: boolean | number;
  onToggleEquip: () => void;
  name: string;
  rarity?: Rarity;
  backColor?: string;
  foreColor?: string;
  unspentPoints?: number;
};

const rarityColors: Record<string, { border: string; bg: string }> = {
  common: { border: "#26a0f5", bg: "#e3f2fd" }, // blau
  uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
  rare: { border: "#8e44ad", bg: "#f3e5f5" }, // lila
  ultra_rare: { border: "#e53935", bg: "#ffebee" }, // rot
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
}) => {
  const isBuyMode = typeof equipped === "number";
  const colors = rarityColors[rarity] ?? rarityColors.common;

  console.log(imageSrc, foreColor, backColor, "HAALLLOO");

  return (
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
        {/* Bildbereich mit schwarzem Innenrahmen */}
        <Box sx={{ p: 1 }}>
          {foreColor == null && backColor == null && (
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
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
          {foreColor != null && backColor == null && (
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
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
                {/* ForeColor Box in der Mitte */}
                <Box
                  sx={{
                    backgroundColor: foreColor, // z. B. theme.palette.secondary.main
                    borderRadius: 2,
                    width: "80%",
                    height: "80%",
                  }}
                />
              </Box>
            </Box>
          )}
          {foreColor != null && backColor != null && (
            <Box
              sx={{
                border: "3px solid #000",
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                backgroundColor: "#fff",
              }}
            >
              <Box
                sx={{
                  backgroundColor: backColor, // z. B. theme.palette.primary.main
                  borderRadius: 0,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                  width: "100%", // oder flexibel anpassen
                  height: "100%",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: foreColor, // z. B. theme.palette.secondary.main
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 1.5, // Abstand für inneren Bereich
                    width: "80%", // oder flexibel anpassen
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

        {/* Beschreibung + Infos */}
        <Box sx={{ px: 2, pb: 1 }}>
          {description && (
            <Typography variant="body1" sx={{ mb: 1, textAlign: "center" }}>
              {description}
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>
            {isBuyMode && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Price:</strong> {equipped} DP
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Rarity:</strong>{" "}
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onToggleEquip}
          variant="contained"
          disabled={isBuyMode && unspentPoints < equipped}
        >
          {isBuyMode
            ? unspentPoints < equipped
              ? "Not enough DP" // ❌ zu wenig Punkte
              : `Buy for ${equipped} DP`
            : equipped
            ? "Unequip"
            : "Equip"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecorationPopup;
