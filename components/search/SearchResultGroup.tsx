"use client";

import { SearchResultGroupAssessmentFragment$key } from "@/__generated__/SearchResultGroupAssessmentFragment.graphql";
import { SearchResultGroupMediaFragment$key } from "@/__generated__/SearchResultGroupMediaFragment.graphql";
import { MediaRecordIcon } from "@/components/MediaRecordIcon";
import {
  ExpandLess,
  ExpandMore,
  QuestionAnswerRounded,
  Quiz,
} from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  Link,
  Paper,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ContentTypeToColor } from "../content-link/ContentLink";
import { SearchResultMediaItem } from "./SearchResultItem";

export function MediaRecordSearchResultGroup({
  _searchResults,
  collapsedResultCount,
}: {
  _searchResults: SearchResultGroupMediaFragment$key;
  collapsedResultCount: number;
}) {
  const searchResults = useFragment(
    graphql`
      fragment SearchResultGroupMediaFragment on MediaRecordSegmentSemanticSearchResult
      @relay(plural: true) {
        ...SearchResultItemFragmentMedia
        mediaRecordSegment {
          ... on DocumentRecordSegment {
            mediaRecordId
            __typename
            mediaRecord {
              type
              id
              name
              contents {
                metadata {
                  name
                  course {
                    title
                    id
                  }
                  chapter {
                    title
                    id
                  }
                }
                id
              }
            }
          }
          ... on VideoRecordSegment {
            mediaRecordId
            __typename
            mediaRecord {
              type
              id
              name
              contents {
                metadata {
                  name
                  chapter {
                    title
                    id
                  }
                  course {
                    title
                    id
                  }
                }
                id
              }
            }
          }
        }
      }
    `,
    _searchResults
  );
  const [isExpanded, setIsExpanded] = useState(true);
  function toggleExpanded() {
    setIsExpanded(!isExpanded);
  }

  const [doShowMoreResults, setDoShowMoreResults] = useState(false);
  function toggleShowMoreResults() {
    setDoShowMoreResults(!doShowMoreResults);
  }

  if (!("mediaRecord" in searchResults[0].mediaRecordSegment)) {
    return <></>;
  }

  const mediaRecord = searchResults[0].mediaRecordSegment?.mediaRecord;
  const content = mediaRecord?.contents.find(
    (x) => x !== undefined && x !== null
  );

  if (!content) return <></>;

  function renderResultsIfExpanded() {
    if (isExpanded) {
      return (
        <div>
          {searchResults
            .slice(0, collapsedResultCount)
            .map((result, index: number) => {
              return (
                <Box key={index}>
                  {index > 0 && <Divider variant="middle" />}
                  <SearchResultMediaItem
                    courseId={content!.metadata.course.id}
                    contentId={content!.id}
                    _searchResult={result}
                  />
                </Box>
              );
            })}

          <Button
            variant={doShowMoreResults ? "contained" : "outlined"}
            disableElevation={true}
            startIcon={doShowMoreResults ? <ExpandLess /> : <ExpandMore />}
            sx={{
              alignSelf: "flex-start",
              width: "100%",
              borderRadius: doShowMoreResults ? 0 : "20px",
              height: "40px",
            }}
            onClick={toggleShowMoreResults}
          >
            {doShowMoreResults
              ? "Hide less relevant results"
              : "Show less relevant results"}
          </Button>

          {/* Show the rest of the results if user has expanded the result group */}
          {doShowMoreResults &&
            searchResults
              .slice(collapsedResultCount, searchResults.length)
              .map((result, index) => {
                return (
                  <Box key={index}>
                    {index > 0 && <Divider variant="middle" />}
                    <SearchResultMediaItem
                      courseId={content!.metadata.course.id}
                      contentId={content!.id}
                      _searchResult={result}
                    />
                  </Box>
                );
              })}
        </div>
      );
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{ margin: "15px", borderRadius: "20px" }}
    >
      <Box sx={{ display: "flex", width: "100%" }}>
        <Tooltip title="Toggle expanded view">
          <IconButton
            onClick={toggleExpanded}
            className="m-1"
            sx={{ float: "left" }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          sx={{
            padding: "10px",
            color: "black",
          }}
        >
          <Link color="inherit" href={`/courses/${content.metadata.course.id}`}>
            {content.metadata.course.title}
          </Link>
          <Link
            color="inherit"
            href={`/courses/${content.metadata.course.id}?chapterId=${content.metadata.chapter.id}`}
          >
            {content.metadata.chapter.title}
          </Link>
          <Link
            color="inherit"
            href={`/courses/${content.metadata.course.id}/media/${content.id}`}
          >
            {content.metadata.name}
          </Link>
          <Link
            color="inherit"
            href={
              searchResults[0].mediaRecordSegment.__typename ===
              "VideoRecordSegment"
                ? `/courses/${content.metadata.course.id}/media/${content.id}?selectedVideo=${searchResults[0].mediaRecordSegment.mediaRecordId}`
                : `/courses/${content.metadata.course.id}/media/${content.id}?selectedDocument=${searchResults[0].mediaRecordSegment.mediaRecordId}`
            }
          >
            {searchResults[0].mediaRecordSegment.mediaRecord?.name}
          </Link>
          <Tooltip
            title={searchResults[0].mediaRecordSegment.mediaRecord?.type}
          >
            <Box
              sx={{
                marginLeft: "auto",
                alignSelf: "center",
                paddingRight: "24px",
              }}
            >
              <MediaRecordIcon
                type={searchResults[0].mediaRecordSegment.mediaRecord?.type}
              />
            </Box>
          </Tooltip>
        </Breadcrumbs>
      </Box>
      <Box sx={{ borderRadius: "20px" }} className="bg-white">
        {renderResultsIfExpanded()}
      </Box>
    </Paper>
  );
}

export function AssessmentSearchResultGroup({
  _searchResults,
}: {
  _searchResults: SearchResultGroupAssessmentFragment$key;
}) {
  const { assessment } = useFragment(
    graphql`
      fragment SearchResultGroupAssessmentFragment on AssessmentSemanticSearchResult {
        assessment {
          __typename
          metadata {
            name
            chapter {
              title
              id
            }
            course {
              title
              id
            }
          }
          id
        }
        __typename
      }
    `,
    _searchResults
  );

  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{ margin: "15px", borderRadius: "20px" }}
    >
      <Box className="flex items-center w-full">
        <div className="aspect-square w-[40px] m-1"></div>
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          sx={{
            padding: "10px",
            color: "black",
          }}
        >
          <Link
            color="inherit"
            href={`/courses/${assessment.metadata.course.id}`}
          >
            {assessment.metadata.course.title}
          </Link>
          <Link
            color="inherit"
            href={`/courses/${assessment.metadata.course.id}?chapterId=${assessment.metadata.chapter.id}`}
          >
            {assessment.metadata.chapter.title}
          </Link>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{ borderRadius: "20px" }}
        className="p-[15px] flex items-center gap-2"
      >
        <div
          className="h-[40px] aspect-square rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              theme.palette.assessment[
                ContentTypeToColor[assessment.__typename]
              ],
          }}
        >
          {assessment.__typename === "FlashcardSetAssessment" ? (
            <QuestionAnswerRounded
              sx={{
                color: theme.palette.colorBlind ? "white" : "text.secondary",
                backgroundColor:
                  theme.palette.assessment[
                    ContentTypeToColor[assessment.__typename]
                  ],
              }}
            />
          ) : assessment.__typename === "QuizAssessment" ? (
            <Quiz
              sx={{
                color: theme.palette.colorBlind ? "white" : "text.secondary",
                backgroundColor:
                  theme.palette.assessment[
                    ContentTypeToColor[assessment.__typename]
                  ],
              }}
            />
          ) : (
            <div>{assessment.__typename}</div>
          )}
        </div>

        <div className="flex flex-col items-start">
          <Link
            color="inherit"
            href={`/courses/${assessment.metadata.course.id}/media/${assessment.id}`}
          >
            {assessment.metadata.name}
          </Link>
        </div>
      </Box>
    </Paper>
  );
}
