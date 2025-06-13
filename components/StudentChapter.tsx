import { StudentChapterFragment$key } from "@/__generated__/StudentChapterFragment.graphql";
import { stringToColor } from "@/components/ChapterHeader";
import { Chip, Collapse, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ChapterHeader } from "./ChapterHeader";
import { LightTooltip } from "./LightTooltip";
import { OtherContent } from "./OtherContent";
import { StudentSection } from "./StudentSection";

export function StudentChapter({
  _chapter,
  standardExpand,
}: {
  _chapter: StudentChapterFragment$key;
  standardExpand: boolean;
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
        description
        ...ChapterHeaderFragment
        ...OtherContentFragment
        skills {
          skillName
          skillCategory
        }
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

  const [expanded, setExpanded] = useState(standardExpand);

  const skillCategoryMap = new Map<string, string[]>();

  chapter.skills
    .filter((c) => c !== null)
    .forEach((c) => {
      if (!skillCategoryMap.has(c!.skillCategory)) {
        skillCategoryMap.set(c!.skillCategory, []);
      }
      skillCategoryMap.get(c!.skillCategory)!.push(c!.skillName);
    });

  for (const key of skillCategoryMap.keys()) {
    skillCategoryMap.get(key)!.sort();
  }

  const skillChips = Array.from(skillCategoryMap.entries())
    .sort()
    .map(([category, skillNames], index) => (
      <LightTooltip
        key={category}
        title={
          <>
            <p>
              <strong>{category + ":"}</strong>
            </p>
            <ul className="list-disc pl-6">
              {[...new Set(skillNames)].map((skillName, index) => (
                <li key={index}>{skillName}</li>
              ))}
            </ul>
          </>
        }
      >
        <Chip
          key={index}
          sx={{
            fontSize: "0.75rem",
            height: "1.5rem",
            maxWidth: "250px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            backgroundColor: stringToColor(category),
          }}
          label={category}
        />
      </LightTooltip>
    ));

  return (
    <div className="w-full">
      <section ref={handleRef}>
        <ChapterHeader
          courseId={courseId}
          _chapter={chapter}
          expanded={expanded}
          expandable={!standardExpand}
          onExpandClick={() => setExpanded((curr) => !curr)}
          student={true}
        />
        <Collapse in={expanded}>
          <div className="flex flex-col pl-16 pt-6 pr-6 gap-6">
            {chapter.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                onClick={(e) => e.stopPropagation()}
              >
                {chapter.description}
              </Typography>
            )}

            {chapter.skills.length > 0 && (
              <div className="flex items-start flex-wrap gap-2">
                {skillChips}
              </div>
            )}
            <Divider />
            <div className="flex gap-12 items-start overflow-x-auto thin-scrollbar">
              {chapter.sections.map((section) => (
                <StudentSection key={section.id} _section={section} />
              ))}
            </div>
            <OtherContent _chapter={chapter} courseId={courseId} />
          </div>
        </Collapse>
      </section>
    </div>
  );
}
