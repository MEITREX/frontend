import { StudentChapterFragment$key } from "@/__generated__/StudentChapterFragment.graphql";
import { Collapse } from "@mui/material";
import dayjs from "dayjs";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ChapterContent } from "./ChapterContent";
import { ChapterHeader } from "./ChapterHeader";
import { OtherContent } from "./OtherContent";
import { StudentSection } from "./StudentSection";

export function StudentChapter({
  _chapter,
}: {
  _chapter: StudentChapterFragment$key;
}) {
  const searchParams = useSearchParams();
  const selectedChapter = searchParams.get("chapterId");

  const { courseId } = useParams();
  const chapter = useFragment(
    graphql`
      fragment StudentChapterFragment on Chapter {
        id
        title
        number
        suggestedStartDate
        suggestedEndDate
        ...ChapterHeaderFragment
        ...OtherContentFragment
        sections {
          id
          ...StudentSectionFragment
        }
      }
    `,
    _chapter
  );

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && selectedChapter === chapter.id) {
        node.scrollIntoView({ behavior: "smooth" });
      }
    },
    [chapter, selectedChapter]
  );

  const [expanded, setExpanded] = useState(
    (!selectedChapter &&
      dayjs().isBetween(
        chapter.suggestedStartDate,
        chapter.suggestedEndDate
      )) ||
      chapter.id === selectedChapter
  );

  return (
    <section ref={handleRef}>
      <ChapterHeader
        courseId={courseId}
        _chapter={chapter}
        expanded={expanded}
        onExpandClick={() => setExpanded((curr) => !curr)}
        student={true}
      />
      <Collapse in={expanded}>
        <ChapterContent>
          {chapter.sections.map((section) => (
            <StudentSection key={section.id} _section={section} />
          ))}
        </ChapterContent>
        <OtherContent _chapter={chapter} courseId={courseId} />
      </Collapse>
    </section>
  );
}
