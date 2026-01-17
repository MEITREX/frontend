"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import InfoIcon from "@mui/icons-material/Info";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";

export default function StudentUMLAssignment() {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  // 🔹 Mocked Title & Description
  const [title] = React.useState("lorem ipsum");
  const [description] = React.useState("lorem ipsum");

  const Editor = (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MainHylimoEditor />
    </Box>
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Title & Description als Klartext */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {description}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  HyLiMo-Editor
                </Typography>
                <IconButton onClick={() => setFullscreen(true)}>
                  <OpenInFullIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  height: "60vh",
                  minHeight: 500,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                {Editor}
              </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button variant="contained" size="large">
                Submit
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Fullscreen Editor */}
      <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setFullscreen(false)}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              HyLiMo Editor
            </Typography>
            <IconButton color="inherit" onClick={() => setShowInfo((v) => !v)}>
              <InfoIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
          {/* Info-Overlay absolut über dem Editor */}
          <Slide direction="down" in={showInfo} mountOnEnter unmountOnExit>
            <Paper
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={2}>
                {/* 🔹 Klartext statt TextFields */}
                <Typography variant="h6" fontWeight="medium">
                  {title}
                </Typography>
                <Typography variant="body1">{description}</Typography>
              </Stack>
            </Paper>
          </Slide>

          {/* Editor bleibt unverändert, unter dem Overlay */}
          <Box sx={{ height: "100%", width: "100%" }}>{Editor}</Box>
        </Box>
      </Dialog>
    </>
  );
}
