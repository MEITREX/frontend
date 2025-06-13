"use client";
import { LecturerChapter$key } from "@/__generated__/LecturerChapter.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AddSectionButton } from "@/components/AddSectionButton";
import { ChapterHeader, stringToColor } from "@/components/ChapterHeader";
import EditChapterButton from "@/components/EditChapterButton";
import { LightTooltip } from "@/components/LightTooltip";
import { OtherContent } from "@/components/OtherContent";
import { Chip, Divider, Typography } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { LecturerSection } from "./LecturerSection";

export function LecturerChapter({
  _chapter,
  _mediaRecords,
}: {
  _chapter: LecturerChapter$key;
  _mediaRecords: MediaRecordSelector$key;
}) {
  const chapter = useFragment(
    graphql`
      fragment LecturerChapter on Chapter {
        __id

        ...EditChapterButtonFragment
        ...AddFlashcardSetModalFragment
        ...ChapterHeaderFragment
        ...OtherContentFragment
        id
        title
        course {
          id
        }
        description
        skills {
          skillName
          skillCategory
        }
        number
        startDate
        sections {
          id
          ...LecturerSectionFragment
        }
        contentsWithNoSection {
          id
          ...ContentLinkFragment
        }
      }
    `,
    _chapter
  );
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
    <section key={chapter.id}>
      <ChapterHeader
        courseId={chapter.course.id}
        _chapter={chapter}
        action={
          <EditChapterButton _chapter={chapter} courseId={chapter.course.id} />
        }
        student={false}
      />

      <div className="flex flex-col gap-6">
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
          <div className="flex items-start flex-wrap gap-2">{skillChips}</div>
        )}
        <Divider />
        <div className="flex gap-12 items-start overflow-x-auto thin-scrollbar">
          {chapter.sections.map((section) => (
            <LecturerSection
              _mediaRecords={_mediaRecords}
              _section={section}
              key={section.id}
            />
          ))}
          <AddSectionButton chapterId={chapter.id} />
        </div>

        <OtherContent _chapter={chapter} courseId={chapter.course.id} />
      </div>
    </section>
  );
}
