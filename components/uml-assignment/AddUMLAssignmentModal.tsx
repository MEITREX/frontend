"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button, Typography, Paper, Stack, TextField, Box, IconButton, Container, AppBar, Toolbar, Slide,
} from "@mui/material";
import * as React from "react";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";

export function AddUMLAssignmentModal({
                                        open,
                                        onClose,
                                      }: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  const Editor = (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MainHylimoEditor />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            UML Assignment
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Create new UML assignment
          </Typography>

          <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
            <Stack spacing={3}>
              {/* Editable Title */}
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />

              {/* Editable Description */}
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                required
              />

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
            </Stack>
          </Paper>
        </Container>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" size="large">
          Save
        </Button>
      </DialogActions>

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
                {/* Editable fields im Overlay */}
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            </Paper>
          </Slide>

          {/* Editor bleibt unter dem Overlay */}
          <Box sx={{ height: "100%", width: "100%" }}>{Editor}</Box>
        </Box>
      </Dialog>
    </Dialog>
  );
}
