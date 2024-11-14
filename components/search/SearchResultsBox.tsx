"use client";

import { SearchResultsBox$key } from "@/__generated__/SearchResultsBox.graphql";
import { Box } from "@mui/material";
import lodash, { orderBy } from "lodash";
import { graphql, useFragment } from "react-relay";
import {
  AssessmentSearchResultGroup,
  MediaRecordSearchResultGroup,
} from "./SearchResultGroup";

export default function SearchResultsBox({
  searchResults: _searchResults,
}: {
  searchResults: SearchResultsBox$key;
}) {
  const searchResults = useFragment(
    graphql`
      fragment SearchResultsBox on SemanticSearchResult @relay(plural: true) {
        ... on MediaRecordSegmentSemanticSearchResult {
          score
          __typename
          mediaRecordSegment {
            mediaRecordId
          }
          ...SearchResultGroupMediaFragment
        }
        ... on AssessmentSemanticSearchResult {
          score

          __typename
          assessmentId
          ...SearchResultGroupAssessmentFragment
        }
      }
    `,
    _searchResults
  );

  // Group the search results
  const semanticSearchResultGroups = lodash
    .chain(searchResults ?? [])
    .groupBy((result) =>
      "mediaRecordSegment" in result
        ? result.mediaRecordSegment!.mediaRecordId
        : "assessmentId" in result
        ? result.assessmentId
        : "unknown"
    )
    .forEach((group) =>
      orderBy(group, (x) => ("score" in x ? x.score : 0), "asc")
    )
    .orderBy((x) => ("score" in x[0] ? x[0].score : 0), "asc")
    .value();

  return (
    <Box>
      {Object.values(semanticSearchResultGroups).map((resultGroup) => {
        if (
          resultGroup[0].__typename === "MediaRecordSegmentSemanticSearchResult"
        ) {
          return (
            <MediaRecordSearchResultGroup
              _searchResults={resultGroup as any}
              collapsedResultCount={3}
              key={resultGroup?.[0].mediaRecordSegment?.mediaRecordId}
            />
          );
        } else if (
          resultGroup[0].__typename === "AssessmentSemanticSearchResult"
        ) {
          return (
            <AssessmentSearchResultGroup
              _searchResults={resultGroup[0] as any}
              key={resultGroup?.[0].assessmentId}
            />
          );
        }
      })}
    </Box>
  );
}
