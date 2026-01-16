"use client";

import * as React from "react";
import { Box, Container, Paper, Typography, Button, Stack } from "@mui/material";

export default function AssignmentResult() {
  // 🔹 Mocked score & feedback
  const [score] = React.useState(85); // percent
  const [feedback] = React.useState(
    "Great job! You have correctly modeled most of the classes and relationships. Pay attention to inheritance in the next assignment."
  );

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="center">
          {/* Score */}
          <Typography variant="h4" fontWeight="bold" color="primary">
            Score: {score}%
          </Typography>

          {/* Feedback */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Feedback
            </Typography>
            <Typography variant="body1">{feedback}</Typography>
          </Box>

          {/* Optional: Button to retry or continue */}
          <Button variant="contained" size="large">
            Continue
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
