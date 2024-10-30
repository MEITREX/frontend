import { SimilarSegmentsQuery } from "@/__generated__/SimilarSegmentsQuery.graphql";
import SearchResultsBox from "@/components/search/SearchResultsBox";
import {
  CircularProgress,
  Drawer,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useParams } from "next/navigation";
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

  const params = useParams();
  const [onlySameCourse, setOnlySameCourse] = useState(true);

  const segments = useLazyLoadQuery<SimilarSegmentsQuery>(
    graphql`
      query SimilarSegmentsQuery(
        $segmentId: UUID!
        $skip: Boolean!
        $whitelist: [UUID!]
      ) {
        getSemanticallySimilarEntities(
          segmentId: $segmentId
          count: 10
          courseWhitelist: $whitelist
        ) @skip(if: $skip) {
          ...SearchResultsBox
        }
      }
    `,
    {
      segmentId: segmentId!,
      skip: !segmentId,
      whitelist: onlySameCourse ? [params.courseId] : undefined,
    }
  );

  return (
    <Drawer
      open={!!segmentId || isLoading}
      onClose={() => setSegmentId(null)}
      anchor="right"
    >
      <div className="w-[66vw] h-screen flex flex-col">
        {params.courseId && (
          <FormControlLabel
            className="px-4 pt-4"
            control={
              <Switch
                checked={onlySameCourse}
                onChange={(e) => setOnlySameCourse(e.target.checked)}
              />
            }
            label="Only search the current course"
          />
        )}

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
