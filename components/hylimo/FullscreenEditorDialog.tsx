import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import {
    AppBar,
    Box,
    Dialog,
    IconButton,
    Paper,
    Slide,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import { DiagramDownload } from "./DownloadDigram";

interface FullscreenEditorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
  infoContent?: React.ReactNode;
  children: React.ReactNode;
  invisible?: boolean;
  sourceCode?: string;
  fileName?: string;
}

export default function FullscreenEditorDialog({
  open,
  onClose,
  title = "Editor",
  showInfo,
  setShowInfo,
  infoContent,
  children,
  invisible = false,
  sourceCode = "",
  fileName = "diagram"
}: FullscreenEditorDialogProps) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      BackdropProps={
        invisible ? { sx: { backgroundColor: "transparent" } } : undefined
      }
      PaperProps={invisible ? { sx: { opacity: 0 } } : undefined}
    >
      <AppBar sx={{ position: "fixed", zIndex: 1201 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            {title}
          </Typography>
          <DiagramDownload
            diagram={undefined}
            fileName={fileName}
            sourceCode={sourceCode}
          />
          {infoContent && (
            <IconButton color="inherit" onClick={() => setShowInfo(!showInfo)}>
              <InfoIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          pt: 8,
          height: "100%",
          width: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {infoContent && (
          <Slide direction="down" in={showInfo} mountOnEnter unmountOnExit>
            <Paper
              sx={{
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={2}>{infoContent}</Stack>
            </Paper>
          </Slide>
        )}
        <Box sx={{ flex: 1, minHeight: 0, width: "100%" }}>{open ? children : null}</Box>
      </Box>
    </Dialog>
  );
}
