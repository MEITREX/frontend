"use client";

import { Button, Divider, Typography } from "@mui/material";
import { Repeat } from "@mui/icons-material";
import { Suggestion } from "@/components/Suggestion";
import { orderBy } from "lodash";
import * as React from "react";
import { StudentChapter } from "@/components/StudentChapter";
import { useParams, useRouter } from "next/navigation";
import { useLazyLoadQuery, useFragment, graphql } from "react-relay";
import { pageCourseChapterQuery } from "@/__generated__/pageCourseChapterQuery.graphql";
import { ChapterOverviewFragment$key } from "@/__generated__/ChapterOverviewFragment.graphql";

const PageCourseChapterQuery = graphql`
  query pageCourseChapterQuery($id: UUID!) {
    coursesByIds(ids: [$id]) {
      ...ChapterOverviewFragment
    }
  }
`;

export default function Chapters() {
  const router = useRouter();
  const { courseId } = useParams();

  const data = useLazyLoadQuery<pageCourseChapterQuery>(
    PageCourseChapterQuery,
    { id: courseId },
    { fetchPolicy: "network-only" }
  );

  const courseRef = data.coursesByIds?.[0];
  const course = useFragment<ChapterOverviewFragment$key>(
    graphql`
      fragment ChapterOverviewFragment on Course {
        id
        title
        description
        suggestions(amount: 4) {
          ...SuggestionFragment
          content {
            id
          }
        }
        chapters {
          elements {
            id
            startDate
            title
            number
            ...StudentChapterFragment
          }
        }
      }
    `,
    courseRef ?? ({} as ChapterOverviewFragment$key)
  );

  const suggestions = course?.suggestions ?? [];
  const chapters = course?.chapters?.elements ?? [];

  return (
    <div className="flex flex-col items-end w-full gap-4">
      <div className="flex flex-col gap-8 w-full">
        {/* Up Next */}
        <div>
          <div className="flex justify-between items-center">
            <Typography variant="h2">Up next</Typography>
            <Button
              startIcon={<Repeat />}
              onClick={() => router.push(`/courses/${courseId}/flashcards/due`)}
            >
              Repeat learned flashcards
            </Button>
          </div>
          <div className="mt-4 gap-8 flex flex-wrap">
            {suggestions.map((x) => (
              <Suggestion
                courseId={course.id}
                key={x.content.id}
                _suggestion={x}
              />
            ))}
          </div>
        </div>

        {/* Chapters */}
        <div className="flex flex-col w-full gap-4">
          <Typography variant="h2">Chapters</Typography>
          <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
            {orderBy(chapters, [
              (x) => new Date(x.startDate).getTime(),
              "number",
            ]).map((chapter, i) => (
              <React.Fragment key={chapter.id}>
                <StudentChapter _chapter={chapter} standardExpand={false} />
                {i < chapters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
