import React from "react";
import { Box, Typography, Skeleton, FormControl, RadioGroup } from "@mui/material";

export default function RadioButtonsSkeleton() {
  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <Skeleton sx={{ width: "50%" }} />
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <Skeleton sx={{ width: "60%" }} />
        </Typography>

        <RadioGroup>
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton sx={{ width: "20%", height: 24, ml: 2 }} />
              </Box>
              <Box sx={{ mt: 0.5, width: "100%", pl: 4 }}>
                <Skeleton sx={{ width: "80%" }} />
              </Box>
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
