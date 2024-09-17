"use client";

import { pageSemanticSearchQuery } from "@/__generated__/pageSemanticSearchQuery.graphql";
import { Box, Button, Collapse, TextField, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import SearchResult from "./SearchResult";
import SearchResultGroup from "./SearchResultGroup";
import {ManageSearch, ExpandMore, ExpandLess} from '@mui/icons-material';
import { useState } from "react";

export default function SearchPage() {
    const params = useParams();
    const query: string = decodeURIComponent(params.query as string);

    const { semanticSearch } = useLazyLoadQuery<pageSemanticSearchQuery>(
        graphql`
            query pageSemanticSearchQuery($query: String!) {
                semanticSearch(queryText: $query, count: 40) {
                    score
                    mediaRecordSegment {
                        __typename
                        id
                        thumbnail
                        mediaRecordId
                        ...on VideoRecordSegment {
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
                        ...on DocumentRecordSegment {
                            page
                            text
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
                    }
                }
            }
        `,
        { query }
    );

    const semanticSearchResultGroups = Object.values(Object.groupBy(semanticSearch, (result) => result.mediaRecordSegment.mediaRecord?.id ?? "unknown"));
    
    // sort the elements in each group by score from lowest to highest
    semanticSearchResultGroups.forEach((group) => {
        if (group !== undefined)
            group.sort((a, b) => a.score - b.score);
    });

    // sort the groups themselves by the score of the first element in each group
    semanticSearchResultGroups.sort((a, b) => {
        let aScore = a === undefined ? 99999 : a[0].score;
        let bScore = b === undefined ? 99999 : b[0].score;
        return aScore - bScore;
    });

    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    function toggleAdvancedSearch() {
        setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
    }

    return (
        <main>
            <Typography variant="h1">Search</Typography>
            
            <Box sx={{padding: "10px"}}>
                <TextField variant="outlined" label="Search Query" fullWidth defaultValue={query} sx={{my: "10px"}} />
                <Collapse in={isAdvancedSearchOpen}>
                    
                </Collapse>
                <Button 
                    variant="outlined" 
                    sx={{alignSelf: "flex-start"}} 
                    startIcon={<ManageSearch />} 
                    endIcon={isAdvancedSearchOpen ? <ExpandLess /> : <ExpandMore />}
                    onClick={toggleAdvancedSearch}>{isAdvancedSearchOpen ? "Close Advanced Search" : "Advanced Search"}</Button>
            </Box>

            {
                Object.values(semanticSearchResultGroups).map((resultGroup) => {
                    return (
                        <SearchResultGroup searchResults={resultGroup} collapsedResultCount={3} />
                    );
                })
            }
        </main>
    );
}