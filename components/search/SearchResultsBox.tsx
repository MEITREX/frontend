"use client";

import { SearchResultsBox$key } from "@/__generated__/SearchResultsBox.graphql";
import { Box } from "@mui/material";
import lodash from "lodash";
import { graphql, useFragment } from "react-relay";
import SearchResultGroup from "./SearchResultGroup";

export default function SearchResultsBox({
  searchResults: _searchResults,
}: {
  searchResults: SearchResultsBox$key;
}) {
  const searchResults = useFragment(
    graphql`
      fragment SearchResultsBox on SemanticSearchResult @relay(plural: true) {
        score
        ... on MediaRecordSegmentSemanticSearchResult {
          mediaRecordSegment {
            __typename
            id
            thumbnail
            mediaRecordId
            ... on VideoRecordSegment {
              startTime
              screenText
              transcript
              mediaRecord {
                id
                name
                type
                contents {
                  metadata {
                    name
                    chapter {
                      title
                    }
                    course {
                      title
                    }
                  }
                }
              }
            }
            ... on DocumentRecordSegment {
              page
              text
              mediaRecord {
                id
                name
                type
                contents {
                  id
                  metadata {
                    name
                    chapter {
                      id
                      title
                    }
                    course {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    _searchResults
  );

  // Group the search results
  const semanticSearchResultGroups = lodash
    .chain(searchResults ?? [])
    .groupBy((result) => result.mediaRecordSegment.mediaRecord?.id ?? "unknown")
    .forEach((group) => group.sort((a, b) => a.score - b.score))
    .sortBy((group) => group[0].score)
    .value();

  return (
    <Box>
      {Object.values(semanticSearchResultGroups).map((resultGroup) => {
        if (resultGroup !== undefined)
          return (
            <SearchResultGroup
              searchResults={resultGroup}
              collapsedResultCount={3}
              key={
                resultGroup?.[0].mediaRecordSegment.mediaRecordId ?? "undefined"
              }
            />
          );
      })}
    </Box>
  );
}
