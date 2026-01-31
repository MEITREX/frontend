"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

type Input = {
  feedback: string,
  score: number,
}

export default function AssignmentResult({feedback, score}: Input) {
  return (
    <Box sx={{ width: "100%", py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: "100%" }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight="bold" color="primary">
            Score: {score}%
          </Typography>

          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Feedback
            </Typography>
            <Typography variant="body1">{feedback}</Typography>
          </Box>

        </Stack>
      </Paper>
    </Box>
  );
}
