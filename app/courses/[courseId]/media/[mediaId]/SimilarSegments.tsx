import { SimilarSegmentsQuery } from "@/__generated__/SimilarSegmentsQuery.graphql";
import SearchResultsBox from "@/components/search/SearchResultsBox";
import { CircularProgress, Drawer } from "@mui/material";
import { useState, useTransition } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import useBus from "use-bus";

export function SimilarSegments() {
  const [segmentId, setsegmentId] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useBus("searchSimilarSegment", (e) => {
    if ("segmentId" in e) {
      startTransition(() => setsegmentId(e.segmentId));
    }
  });

  const segments = useLazyLoadQuery<SimilarSegmentsQuery>(
    graphql`
      query SimilarSegmentsQuery($segmentId: UUID!, $skip: Boolean!) {
        getSemanticallySimilarMediaRecordSegments(
          mediaRecordSegmentId: $segmentId
          count: 10
        ) @skip(if: $skip) {
          ...SearchResultsBox
        }
      }
    `,
    { segmentId: segmentId!, skip: !segmentId }
  );

  return (
    <Drawer
      open={!!segmentId || isLoading}
      onClose={() => setsegmentId(null)}
      anchor="right"
    >
      <div className="w-[66vw] h-screen flex">
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <CircularProgress className="place-self-center justify-self-center" />
          </div>
        )}
        {segments.getSemanticallySimilarMediaRecordSegments && (
          <SearchResultsBox
            searchResults={segments.getSemanticallySimilarMediaRecordSegments}
          />
        )}
      </div>
    </Drawer>
  );
}
