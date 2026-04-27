"use client";

import type { Root } from "@hylimo/diagram-common";
import { PDFRenderer } from "@hylimo/diagram-render-pdf";
import { SVGRenderer } from "@hylimo/diagram-render-svg";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import saveAs from "file-saver";
import { useCallback, useMemo, useState } from "react";

interface DiagramDownloadProps {
  diagram: Root | undefined;
  fileName: string;
  sourceCode: string;
  variant?: "button" | "icon";
}

export function DiagramDownload({ diagram, fileName, sourceCode, variant = "button" }: DiagramDownloadProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  // Memoize renderer instances to avoid recreating them on every render
  const svgRenderer = useMemo(() => new SVGRenderer(), []);
  const pdfRenderer = useMemo(() => new PDFRenderer(), []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const downloadSVG = useCallback(
    async (textAsPath: boolean) => {
      if (!diagram) return;

      try {
        const svgContent = await svgRenderer.render(diagram, textAsPath);
        const svgBlob = new Blob([svgContent], {
          type: "image/svg+xml;charset=utf-8"
        });
        saveAs(svgBlob, `${fileName}.svg`);
        handleClose();
      } catch (error) {
        console.error("Error downloading SVG:", error);
      }
    },
    [diagram, fileName, svgRenderer]
  );

  const downloadPDF = useCallback(
    async () => {
      if (!diagram) return;

      try {
        const pdf = await pdfRenderer.render(diagram, "#ffffff");
        saveAs(new Blob(pdf, { type: "application/pdf" }), `${fileName}.pdf`);
        handleClose();
      } catch (error) {
        console.error("Error downloading PDF:", error);
      }
    },
    [diagram, fileName, pdfRenderer]
  );

  const downloadSource = useCallback(() => {
    if (!sourceCode) return;
    saveAs(new Blob([sourceCode]), `${fileName}.hyl`);
    handleClose();
  }, [fileName, sourceCode]);

  return (
    <>
      {variant === "icon" ? (
        <Tooltip title="Download">
          <IconButton
            onClick={handleClick}
            disabled={!diagram && !sourceCode}
            size="small"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          onClick={handleClick}
          disabled={!diagram && !sourceCode}
          startIcon={<DownloadIcon />}
          variant="contained"
          size="small"
        >
          Download
        </Button>
      )}

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
      >
        <MenuItem
          onClick={() => downloadSVG(false)}
          disabled={!diagram}
        >
          SVG
        </MenuItem>
        <Tooltip
          title="Powerpoint and many others do not support embedded fonts, so the text is converted to a path instead"
          placement="right"
        >
          <MenuItem
            onClick={() => downloadSVG(true)}
            disabled={!diagram}
          >
            SVG (text as path)
          </MenuItem>
        </Tooltip>
        <MenuItem
          onClick={downloadPDF}
          disabled={!diagram}
        >
          PDF
        </MenuItem>
        <MenuItem onClick={downloadSource} disabled={!sourceCode}>
          Source
        </MenuItem>
      </Menu>
    </>
  );
}