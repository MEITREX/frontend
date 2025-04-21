import { IconButton, Popover, Typography, Box } from "@mui/material";
import React, { useRef, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";

interface Props {
  children: React.ReactNode;
}

const InfoPopover = ({ children }: Props) => {
  const popoverRef = useRef(null);
  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <>
      <IconButton onClick={() => setPopoverVisible(true)} ref={popoverRef}>
        <InfoIcon />
      </IconButton>
      <Popover
        open={popoverVisible}
        onClose={() => setPopoverVisible(false)}
        anchorEl={popoverRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, maxWidth: "500px" }}>{children}</Box>
      </Popover>
    </>
  );
};

export default InfoPopover;
