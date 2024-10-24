"use client";

import { SearchResultItemFragmentMedia$key } from "@/__generated__/SearchResultItemFragmentMedia.graphql";
import ExpandableText from "@/components/ExpandableText";
import { Box, styled } from "@mui/material";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Link from "next/link";
import { graphql, useFragment } from "react-relay";

dayjs.extend(duration);

export const NoMaxWidthTooltip = styled(
  ({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

export function SearchResultMediaItem({
  _searchResult,
  courseId,
  contentId,
}: {
  _searchResult: SearchResultItemFragmentMedia$key;
  courseId: string;
  contentId: string;
}) {
  const { mediaRecordSegment } = useFragment(
    graphql`
      fragment SearchResultItemFragmentMedia on MediaRecordSegmentSemanticSearchResult {
        mediaRecordSegment {
          ... on VideoRecordSegment {
            thumbnail
            transcript
            startTime
            mediaRecordId
            __typename
          }
          ... on DocumentRecordSegment {
            thumbnail
            text
            page
            mediaRecordId
            __typename
          }
        }
      }
    `,
    _searchResult
  );

  if (mediaRecordSegment.__typename === "%other") {
    return <></>;
  }

  const href =
    mediaRecordSegment.__typename === "VideoRecordSegment"
      ? `/courses/${courseId}/media/${contentId}?selectedVideo=${mediaRecordSegment.mediaRecordId}`
      : `/courses/${courseId}/media/${contentId}?selectedDocument=${mediaRecordSegment.mediaRecordId}`;

  return (
    <Box sx={{ display: "flex", padding: "15px" }}>
      <NoMaxWidthTooltip
        placement="right"
        title={
          <img
            alt=""
            src={mediaRecordSegment?.thumbnail}
            style={{
              height: "50vh",
              maxWidth: "50vw",
              width: "auto",
              objectFit: "contain",
            }}
          />
        }
      >
        <img
          alt=""
          src={mediaRecordSegment?.thumbnail}
          style={{
            height: 140,
            width: "auto",
            objectFit: "contain",
          }}
        />
      </NoMaxWidthTooltip>
      <Box>
        <Box sx={{ px: "15px" }}>
          <Link
            className="underline"
            href={
              mediaRecordSegment.__typename === "VideoRecordSegment"
                ? `${href}&videoPosition=${mediaRecordSegment?.startTime}`
                : `${href}&page=${mediaRecordSegment.page + 1}`
            }
          >
            {mediaRecordSegment.__typename === "VideoRecordSegment"
              ? dayjs
                  .duration(mediaRecordSegment.startTime, "seconds")
                  .format("HH:mm:ss")
              : `Page ${mediaRecordSegment.page + 1}`}
          </Link>
          <ExpandableText
            text={
              mediaRecordSegment.__typename === "VideoRecordSegment"
                ? mediaRecordSegment.transcript
                : mediaRecordSegment.text
            }
            collapsedSize={90}
          />
        </Box>
      </Box>
    </Box>
  );
}
