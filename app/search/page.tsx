"use client";

import { pageSemanticSearchQuery, pageSemanticSearchQuery$data } from "@/__generated__/pageSemanticSearchQuery.graphql";
import { Autocomplete, Box, Button, Collapse, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import SearchResultGroup from "./SearchResultGroup";
import {ManageSearch, ExpandMore, ExpandLess, Search} from '@mui/icons-material';
import { useState } from "react";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query: string | null = searchParams.get("query");

    const { semanticSearch, currentUserInfo } = useLazyLoadQuery<pageSemanticSearchQuery>(
        graphql`
            query pageSemanticSearchQuery($query: String!, $count: Int!, $skipQuery: Boolean!, $courseWhitelist: [UUID!]) {
                semanticSearch(queryText: $query, count: $count, courseWhitelist: $courseWhitelist) @skip(if: $skipQuery) {
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
                currentUserInfo {
                    id
                    availableCourseMemberships {
                        course {
                            id
                            title
                        }
                    }
                }
            }
        `,
        { 
            query: query ?? "", 
            count: searchParams.get("count") ? parseInt(searchParams.get("count")!) : 20,
            courseWhitelist: searchParams.get("courses") ? searchParams.get("courses")!.split(",") : null,
            skipQuery: query === null
        }
    );

    // Sort the results into groups based on the media record they belong to. semanticSearch might be null if no query text was
    // provided, use an empty array in that case.
    const semanticSearchResultGroups = Object.values(
        Object.groupBy(semanticSearch ?? [], (result) => result.mediaRecordSegment.mediaRecord?.id ?? "unknown"));
    
    // sort the elements in each group by score from lowest to highest
    semanticSearchResultGroups.forEach((group) => {
        if (group !== undefined)
            group.sort((a, b) => a.score - b.score);
    });

    // sort the groups themselves by the score of the first element in each group
    semanticSearchResultGroups.sort((a, b) => {
        let aScore = a?.[0].score ?? 99999;
        let bScore = b?.[0].score ?? 99999;
        return aScore - bScore;
    });

    // open advanced search by default if an advanced search parameter was provided
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(searchParams.get("courses") !== null || searchParams.get("count") !== null);
    function toggleAdvancedSearch() {
        setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
    }

    const [queryTextFieldValue, setQueryTextFieldValue] = useState(query);

    const [advancedSearchSelectedCourses, setAdvancedSearchSelectedCourses] = useState<any[]>([]);
    const [advancedSearchResultCount, setAdvancedSearchResultCount] = useState(20);

    return (
        <main>
            <Typography variant="h1">Search</Typography>
            
            <Box sx={{padding: "10px"}}>
                <TextField 
                    variant="outlined" 
                    label="Search Query" 
                    fullWidth 
                    sx={{my: "8px"}}
                    value={queryTextFieldValue} 
                    onChange={(e) => setQueryTextFieldValue(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === "Enter") {
                            router.push(`/search?query=${queryTextFieldValue}`);
                        }
                    }}
                    InputLabelProps={{shrink: true}}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">
                        <IconButton
                            color="primary"
                            aria-label="search"
                            onClick={(e) => {
                                // if advanced search is open, pass the advanced search parameters, otherwise don't
                                if(isAdvancedSearchOpen) {
                                    let url = `/search?query=${queryTextFieldValue}&count=${advancedSearchResultCount}`;
                                    if(advancedSearchSelectedCourses.length > 0) {
                                        url += `&courses=${advancedSearchSelectedCourses.map(x => x.id).join(",")}`;
                                    }
                                    router.push(url)
                                } else {
                                    router.push(`/search?query=${queryTextFieldValue}`)
                                }
                            }}>
                            <Search />
                        </IconButton>
                </InputAdornment>,
                    }} />
                <Collapse in={isAdvancedSearchOpen}>
                    <Paper 
                        variant="outlined"
                        sx={{padding: "16px", my: "8px"}}>
                        <Autocomplete
                            multiple
                            sx={{my: "8px"}}
                            options={currentUserInfo?.availableCourseMemberships.map(x => x.course) ?? []}
                            getOptionLabel={(option) => option.title}
                            value={advancedSearchSelectedCourses}
                            onChange={(_, value) => setAdvancedSearchSelectedCourses(value)}
                            renderInput={(params) => <TextField {...params} InputLabelProps={{shrink: true}} label="Limit search to courses" />}
                            />
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Number of results"
                            value={advancedSearchResultCount}
                            onChange={(e) => setAdvancedSearchResultCount(parseInt(e.target.value))}
                            InputLabelProps={{shrink: true}} />
                    </Paper>
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
                        <SearchResultGroup 
                        searchResults={resultGroup} 
                        collapsedResultCount={3} 
                        key={resultGroup?.[0].mediaRecordSegment.mediaRecordId ?? "undefined"} />
                    );
                })
            )}
        </main>
    );
}