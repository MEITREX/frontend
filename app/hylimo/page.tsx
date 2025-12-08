"use client";

import { Box } from "@mui/material";
import Split from "react-split";

export const HyLiMoEditor = () => {

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        "& .split": { display: "flex", height: "100%" },
        "& .gutter": {
          backgroundColor: "action.hover",
          width: "10px !important",
          cursor: "col-resize",
        },
        "& .gutter:hover": { backgroundColor: "primary.main" },
      }}
    >
      <Split className="split" sizes={[50, 50]} minSize={100} gutterSize={10}>
        {/* LEFT: Monaco Editor */}
        <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box p={2}> Monaco </Box>
        </div>

        {/* RIGHT: Sprotty */}
        <div style={{ height: "100%", overflow: "hidden" }}>
          <Box p={2}> Sprotty </Box>
        </div>
      </Split>
    </Box>
  );
};

export default HyLiMoEditor;
