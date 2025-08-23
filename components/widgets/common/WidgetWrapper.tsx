import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import * as React from "react";

type WidgetWrapperProps = {
  title: string;
  linkHref?: string;
  linkLabel?: string;
  children: React.ReactNode;
  overflow?:string;
};

export default function WidgetWrapper({
                                        title,
                                        linkHref,
                                        linkLabel,
                                        children,
                                        overflow = "auto"
                                      }: WidgetWrapperProps) {
  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 1,
        mb: 2,
        maxWidth: 450,
        maxHeight: 400,
        minHeight: 400,
        overflowY:overflow,
        position:"relative"
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography mt={1} ml={1} variant="h6">
          {title}
        </Typography>

        {linkHref && linkLabel && (
          <Link href={linkHref} passHref>
            <Button
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: "#009bde",
                color: "white",
                "&:hover": {
                  backgroundColor: "#3369ad",
                },
              }}
            >
              {linkLabel}
            </Button>
          </Link>
        )}
      </Box>
      {children}
    </Box>
  );
}
