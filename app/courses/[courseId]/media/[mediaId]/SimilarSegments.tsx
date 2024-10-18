import { SimilarSegmentsQuery } from "@/__generated__/SimilarSegmentsQuery.graphql";
import SearchResultsBox from "@/components/search/SearchResultsBox";
import { CircularProgress, Drawer } from "@mui/material";
import { useState, useTransition } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import useBus from "use-bus";

export function SimilarSegments() {
  const [entityId, setentityId] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useBus("searchSimilarEntity", (e) => {
    if ("entityId" in e) {
      startTransition(() => setentityId(e.entityId));
    }
  });

  const segments = useLazyLoadQuery<SimilarSegmentsQuery>(
    graphql`
      query SimilarSegmentsQuery($entityId: UUID!, $skip: Boolean!) {
        getSemanticallySimilarEntities(entityId: $entityId, count: 10)
          @skip(if: $skip) {
          ...SearchResultsBox
        }
      }
    `,
    { entityId: entityId!, skip: !entityId }
  );

  return (
    <Drawer
      open={!!entityId || isLoading}
      onClose={() => setentityId(null)}
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
