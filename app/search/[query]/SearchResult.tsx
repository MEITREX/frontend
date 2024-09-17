"use client";

import ExpandableText from '@/components/ExpandableText';
import { Box, styled, Typography } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';

function getSegmentContents(mediaRecordSegment: any) {
    switch (mediaRecordSegment.__typename) {
        case "VideoRecordSegment":
            return mediaRecordSegment.transcript;
        case "DocumentRecordSegment":
            return mediaRecordSegment.text;
        default:
            return "Unknown media type";
    }
}

function getSegmentTitle(mediaRecordSegment: any) {
    switch (mediaRecordSegment.__typename) {
        case "VideoRecordSegment":
            return <Typography variant="h6">Time {mediaRecordSegment.screenText}</Typography>;
        case "DocumentRecordSegment":
            return <Typography variant="h6">Page {mediaRecordSegment.page + 1}</Typography>;
        default:
            return <Typography variant="h6">Unknown media type</Typography>;
    }
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 'none',
    },
  });

export default function SearchResult({ searchResult }: { searchResult: any }) {
    return <Box sx={{display: "flex", padding: "15px"}}>
        <NoMaxWidthTooltip placement="right" title={
            <img src={searchResult.mediaRecordSegment.thumbnail} style={
                {
                    height: "50vh",
                    maxWidth: "50vw",
                    width: "auto",
                    objectFit: "contain"
                }} />
        }>
            <img src={searchResult.mediaRecordSegment.thumbnail} style={
            {
                height: 140, 
                width: "auto",
                objectFit: "contain"
            }} />
        </NoMaxWidthTooltip>
        <Box>
            <Box sx={{px: "15px"}}>
                {getSegmentTitle(searchResult.mediaRecordSegment)}
                <ExpandableText text={getSegmentContents(searchResult.mediaRecordSegment)} collapsedSize={90} />
            </Box>
        </Box>
    </Box>
}