"use client";

import { ItemsApiUnequipItemMutation } from "@/__generated__/ItemsApiUnequipItemMutation.graphql";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useMutation } from "react-relay";
import { unequipItemMutation } from "./api/ItemsApi";

type UnequipCardProps = {
  equippedItem?: any | null;
};

// First element in list, unequips the equiped item of a certain category
export default function UnequipCard({ equippedItem }: UnequipCardProps) {
  const [unequipItem] =
    useMutation<ItemsApiUnequipItemMutation>(unequipItemMutation);

  const clickTimer = React.useRef<number | null>(null);
  const isLockedDefault = equippedItem.name === "Default Profile Picture";
  const disabled = !equippedItem || isLockedDefault;
  const [openDialog, setOpenDialog] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
    };
  }, []);

  // Handles clicks, manages single or double click
  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;

    // Double click
    if (e.detail === 2) {
      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      onUnequip();
      return;
    }

    // Single click
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      onOpenPopup();
      clickTimer.current = null;
    }, 220);
  };

  // Call mutation
  function onUnequip() {
    if (!equippedItem || isLockedDefault) return;
    unequipItem({
      variables: {
        itemId: equippedItem.id,
      },
    });
  }

  // Open unequip PopUp when single click
  function onOpenPopup() {
    setOpenDialog(true);
  }

  function handleConfirm(): void {
    onUnequip();
    setOpenDialog(false);
  }

  return (
    <>
      <Card
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          border: "2px solid",
          borderRadius: 3,
          borderColor: disabled ? "grey.400" : "orange",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          userSelect: "none",
          outline: "none",
          "&:focus-visible": {
            boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}55`,
            borderColor: "orange",
          },
        }}
      >
        {/* Set text depending on if something is equiped */}
        <Box textAlign="center">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            {(!equippedItem && "Nothing equipped") ||
              (isLockedDefault && "Default item locked") ||
              "Unequip current"}
          </div>
          {!!equippedItem && (
            <div style={{ opacity: 0.8 }}>{equippedItem!.name}</div>
          )}
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            {(!equippedItem && "—") ||
              (isLockedDefault
                ? "This default item can't be unequipped"
                : "Double-click to unequip")}
          </div>
        </Box>
      </Card>
      {/* PopUp for single click */}
      <Dialog
        open={openDialog && !disabled}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Unequip</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to unequip the item for this category?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Unequip
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
