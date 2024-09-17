"use client";

import { pageSemanticSearchQuery, pageSemanticSearchQuery$data } from "@/__generated__/pageSemanticSearchQuery.graphql";
import { Box, Button, Collapse, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import SearchResult from "./SearchResult";
import SearchResultGroup from "./SearchResultGroup";
import {ManageSearch, ExpandMore, ExpandLess, Search} from '@mui/icons-material';
import { useState } from "react";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query: string | null = searchParams.get("query");

    let semanticSearchResultGroups: (pageSemanticSearchQuery$data["semanticSearch"][0][] | undefined)[] = [];

    if(query !== null) {
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
    
        semanticSearchResultGroups = Object.values(Object.groupBy(semanticSearch, (result) => result.mediaRecordSegment.mediaRecord?.id ?? "unknown"));
    }
    
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

    const [queryTextFieldValue, setQueryTextFieldValue] = useState(query);

    return (
        <main>
            <Typography variant="h1">Search</Typography>
            
            <Box sx={{padding: "10px"}}>
                <TextField 
                    variant="outlined" 
                    label="Search Query" 
                    fullWidth 
                    sx={{my: "10px"}}
                    value={queryTextFieldValue} 
                    onChange={(e) => setQueryTextFieldValue(e.target.value)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">
                        <IconButton
                            aria-label="search"
                            onClick={(e) => router.push(`/search?query=${queryTextFieldValue}`)}>
                            <Search />
                        </IconButton>
                </InputAdornment>,
                    }} />
                <Collapse in={isAdvancedSearchOpen}>
                    
                </Collapse>
                <Button 
                    variant="outlined" 
                    sx={{alignSelf: "flex-start"}} 
                    startIcon={<ManageSearch />} 
                    endIcon={isAdvancedSearchOpen ? <ExpandLess /> : <ExpandMore />}
                    onClick={toggleAdvancedSearch}>{isAdvancedSearchOpen ? "Close Advanced Search" : "Advanced Search"}</Button>
            </Box>

            {((query !== null) &&
                Object.values(semanticSearchResultGroups).map((resultGroup) => {
                    return (
                        <SearchResultGroup searchResults={resultGroup} collapsedResultCount={3} />
                    );
                })
            )}
        </main>
    );
}