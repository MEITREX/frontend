"use client";

import { pageSemanticSearchQuery$data } from "@/__generated__/pageSemanticSearchQuery.graphql";
import lodash from "lodash";
import SearchResultGroup from "./SearchResultGroup";
import { Box } from "@mui/material";

export default function SearchResultsBox({ searchResults }: 
    { searchResults:pageSemanticSearchQuery$data['semanticSearch'] }
) {
    // Group the search results
    const semanticSearchResultGroups = lodash.chain(searchResults ?? [])
        .groupBy((result) => result.mediaRecordSegment.mediaRecord?.id ?? "unknown")
        .forEach((group) => group.sort((a, b) => a.score - b.score))
        .sortBy((group) => group[0].score)
        .value();

    return <Box>{(Object.values(semanticSearchResultGroups).map((resultGroup) => {
            if(resultGroup !== undefined)
                return (
                    <SearchResultGroup 
                    searchResults={resultGroup} 
                    collapsedResultCount={3} 
                    key={resultGroup?.[0].mediaRecordSegment.mediaRecordId ?? "undefined"} />
                );
        })
    )}
    </Box>
}