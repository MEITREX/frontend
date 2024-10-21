import { SimilarSegmentsQuery } from "@/__generated__/SimilarSegmentsQuery.graphql";
import SearchResultsBox from "@/components/search/SearchResultsBox";
import { CircularProgress, Drawer } from "@mui/material";
import { useState, useTransition } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import useBus from "use-bus";

export function SimilarSegments() {
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useBus("searchSimilarEntity", (e) => {
    if ("segmentId" in e) {
      startTransition(() => setSegmentId(e.segmentId));
    }
  });

  const segments = useLazyLoadQuery<SimilarSegmentsQuery>(
    graphql`
      query SimilarSegmentsQuery($segmentId: UUID!, $skip: Boolean!) {
        getSemanticallySimilarEntities(segmentId: $segmentId, count: 10)
          @skip(if: $skip) {
          ...SearchResultsBox
        }
      }
    `,
    { segmentId: segmentId!, skip: !segmentId }
  );

  return (
    <Drawer
      open={!!segmentId || isLoading}
      onClose={() => setSegmentId(null)}
      anchor="right"
    >
      <div className="w-[66vw] h-screen flex">
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <CircularProgress className="place-self-center justify-self-center" />
          </div>
        )}
        {segments.getSemanticallySimilarEntities && (
          <SearchResultsBox
            searchResults={segments.getSemanticallySimilarEntities}
          />
        )}
      </div>
    </Drawer>
  );
}
