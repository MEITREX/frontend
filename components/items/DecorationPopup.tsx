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

type Props = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  description: string;
  equipped: boolean;
  onToggleEquip: () => void;
  name: string;
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
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        {name}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center" }}>
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: "100%",
            borderRadius: 2,
            mb: 2,
            objectFit: "cover",
            aspectRatio: "1 / 1",
          }}
        />
        <Typography variant="body1">{description}</Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        {typeof equipped === "boolean" ? (
          <Button onClick={onToggleEquip} variant="contained">
            {equipped ? "Unequip" : "Equip"}
          </Button>
        ) : (
          <Button onClick={onToggleEquip} variant="contained">
            Buy for {equipped} DP
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DecorationPopup;
