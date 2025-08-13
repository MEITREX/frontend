// components/UnequipCard.tsx
"use client";

import { UnequipCardUnequipItemPictureMutation } from "@/__generated__/UnequipCardUnequipItemPictureMutation.graphql";
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
import { graphql, useMutation } from "react-relay";

type UnequipCardProps = {
  equippedItem?: any | null;
};

// First element in list, unequips the equiped item of a certain category
export default function UnequipCard({ equippedItem }: UnequipCardProps) {
  const [unequipItem] =
    useMutation<UnequipCardUnequipItemPictureMutation>(graphql`
      mutation UnequipCardUnequipItemPictureMutation($itemId: UUID!) {
        unequipItem(itemId: $itemId) {
          items {
            equipped
            id
            uniqueDescription
            unlocked
            unlockedTime
          }
          unspentPoints
          userId
        }
      }
    `);

  const clickTimer = React.useRef<number | null>(null);
  const disabled = !equippedItem;
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
          height: "243px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          border: "2px dashed",
          borderColor: disabled ? "grey.400" : "primary.main",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          userSelect: "none",
          outline: "none",
          "&:focus-visible": {
            boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}55`,
            borderColor: "primary.main",
          },
        }}
      >
        {/* Set text depending on if something is equiped */}
        <Box textAlign="center">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            {disabled ? "Nothing equipped" : "Unequip current"}
          </div>
          {!disabled && (
            <div style={{ opacity: 0.8 }}>{equippedItem!.name}</div>
          )}
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            {disabled ? "—" : "Double‑click to unequip"}
          </div>
        </Box>
      </Card>
      {/* PopUp for single click */}
      <Dialog
        open={openDialog}
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
