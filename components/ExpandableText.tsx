"use client";

import { Box, Button, Collapse, Typography } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";

export default function ExpandableText({ text, collapsedSize }: { text: string, collapsedSize: number }) {
    const unexpandedStyle = {
        whiteSpace: "pre-line",
        background: `linear-gradient(black ${collapsedSize * 0.5}px, white ${collapsedSize}px)`,
        backgroundClip: "text",
        color: "transparent",
    };
    const expandedStyle = {
        whiteSpace: "pre-line",
    };
    
    const [expanded, setExpanded] = useState(false);
    function toggleExpanded() {
        setExpanded(!expanded);
    };

    const typographyRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    useEffect(() => {
        if (typographyRef.current) {
            // Check if the content overflows
            const { scrollHeight } = typographyRef.current;
            if (scrollHeight > collapsedSize) {
                setIsOverflowing(true);
                setExpanded(false);
            } else {
                setIsOverflowing(false);
                setExpanded(true);
            }
        }
    }, [text]);

    function renderButtonIfIsOverflowing() {
        if (isOverflowing) {
            return <Button startIcon={expanded ? <ExpandLess /> : <ExpandMore />} sx={{alignSelf: "flex-start"}} onClick={toggleExpanded}>
                {expanded ? "Show less" : "Show more"}
            </Button>
        }
    }

    return (<Box sx={{display: "flex", flexDirection: "column"}}>
        <Collapse in={expanded} collapsedSize={collapsedSize}>
            <Typography ref={typographyRef} variant="body2" sx={expanded ? expandedStyle : unexpandedStyle}>
                {text.replaceAll("\n\n", "\n")}
            </Typography>
        </Collapse>
        {renderButtonIfIsOverflowing()}
    </Box>)
}