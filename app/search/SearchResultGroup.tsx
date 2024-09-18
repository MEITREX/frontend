"use client";

import { Box, Breadcrumbs, Button, Card, Divider, IconButton, Link, Paper, Tooltip } from "@mui/material";
import SearchResult from "./SearchResult";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useState } from "react";
import { MediaRecordIcon } from "@/components/MediaRecordIcon";

function renderDividerIfNotFirst(index: number) {
    if (index === 0) {
        return null;
    }
    return <Divider variant="middle" />;
}

export default function SearchResultGroup({ searchResults, collapsedResultCount }: { searchResults: any, collapsedResultCount: number }) {
    // media record is the same for all results in the group, just get the first segment's media record
    const mediaRecord = searchResults[0].mediaRecordSegment.mediaRecord;
    const userAccessibleContent = mediaRecord.contents.find((x: any) => x !== undefined && x !== null);

    const [isExpanded, setIsExpanded] = useState(true);
    function toggleExpanded() {
        setIsExpanded(!isExpanded);
    };

    const [doShowMoreResults, setDoShowMoreResults] = useState(false);
    function toggleShowMoreResults() {
        setDoShowMoreResults(!doShowMoreResults);
    };

    function renderResultsIfExpanded() {
        if(isExpanded) {
            return <div>
                {searchResults.slice(0, collapsedResultCount).map((result: any, index: number) => {
                return (<div>
                    {renderDividerIfNotFirst(index)}
                    <SearchResult searchResult={result} />
                </div>)
                })}

                <Button 
                    variant={doShowMoreResults ? "contained" : "outlined"}
                    disableElevation={true}
                    startIcon={doShowMoreResults ? <ExpandLess /> : <ExpandMore />} 
                    sx={{alignSelf: "flex-start", width: "100%", borderRadius: doShowMoreResults ? 0 : "20px", height: "40px"}} 
                    onClick={toggleShowMoreResults}>
                    {doShowMoreResults ? "Hide less relevant results" : "Show less relevant results"}
                </Button>

                {/* Show the rest of the results if user has expanded the result group */}
                {doShowMoreResults 
                && searchResults.slice(collapsedResultCount, searchResults.length).map((result: any, index: number) => {
                return (<div>
                    {renderDividerIfNotFirst(index)}
                    <SearchResult searchResult={result} />
                </div>)
                })}

                
            </div>
        }
    }

    return <Paper variant="outlined" sx={{margin: "15px", borderRadius: "20px"}} className="bg-slate-200">
        <Box sx={{display: "flex", width: "100%"}}>
            <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{
                padding: "10px",
                color: "black",
                }}>
                <Tooltip title="Toggle expanded view">
                    <IconButton onClick={toggleExpanded} sx={{float: "left"}}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Tooltip>
                <Link color="inherit" href={`/courses/${userAccessibleContent.metadata.course.id}`}>
                    {userAccessibleContent.metadata.course.title}
                </Link>
                <Link color="inherit">
                    {userAccessibleContent.metadata.chapter.title}
                </Link>
                <Link color="inherit" href={`/course/${userAccessibleContent.metadata.course.id}/media/${userAccessibleContent.id}`}>
                    {userAccessibleContent.metadata.name}
                </Link>
                <Link color="inherit" 
                    href={`/course/${userAccessibleContent.metadata.course.id}/media/${userAccessibleContent.id}?recordId=${mediaRecord.id}`}>
                    {mediaRecord.name}
                </Link>
            </Breadcrumbs>

            <Tooltip title={mediaRecord.type}>
                <Box sx={{marginLeft: "auto", alignSelf: "center", paddingRight: "24px"}}>
                    <MediaRecordIcon type={mediaRecord.type} />
                </Box>
            </Tooltip>
        </Box>
        <Box sx={{borderRadius: "20px"}} className="bg-white">
            {renderResultsIfExpanded()}
        </Box>
    </Paper>
}