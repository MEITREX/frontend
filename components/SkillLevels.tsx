import { SkillLevelsFragment$key } from "@/__generated__/SkillLevelsFragment.graphql";
import { BloomLevel } from "@/__generated__/LecturerEditFlashcardMutation.graphql";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import colors from "tailwindcss/colors";
import { Suggestion } from "./Suggestion";

export function SkillLevels({
  className = "",
  _skill,
  courseId,
}: {
  className?: string;
  _skill: SkillLevelsFragment$key;
  courseId: string;
}) {
  const { skillLevels } = useFragment(
    graphql`
      fragment SkillLevelsFragment on Skill {
        skillName
        skillLevels {
          remember {
            value
          }
          understand {
            value
          }
          apply {
            value
          }
          analyze {
            value
          }
          evaluate {
            value
          }
          create {
            value
          }
        }
      }
    `,
    _skill
  );
  if (skillLevels) {
    return (
      <div
        className={`grid grid-flow-col auto-cols-fr gap-6 h-full ${className}`}
      >
        {skillLevels.remember !== null && skillLevels.remember.value > 0 && (
          <SkillLevelLabel label="Remember" color={colors.purple[500]}>
            <SkillLevel
              courseId={courseId}
              value={skillLevels.remember.value}
              bloomLevel="REMEMBER"
            />
          </SkillLevelLabel>
        )}
        {skillLevels.understand !== null &&
          skillLevels.understand.value > 0 && (
            <SkillLevelLabel label="Understand" color={colors.blue[500]}>
              <SkillLevel
                courseId={courseId}
                value={skillLevels.understand.value}
                bloomLevel="UNDERSTAND"
              />
            </SkillLevelLabel>
          )}
        {skillLevels.apply !== null && skillLevels.apply.value > 0 && (
          <SkillLevelLabel label="Apply" color={colors.cyan[500]}>
            <SkillLevel
              courseId={courseId}
              value={skillLevels.apply.value}
              bloomLevel="APPLY"
            />
          </SkillLevelLabel>
        )}
        {skillLevels.analyze !== null && skillLevels.analyze.value > 0 && (
          <SkillLevelLabel label="Analyze" color={colors.green[500]}>
            <SkillLevel
              courseId={courseId}
              value={skillLevels.analyze.value}
              bloomLevel="ANALYZE"
            />
          </SkillLevelLabel>
        )}
        {skillLevels.evaluate !== null && skillLevels.evaluate.value > 0 && (
          <SkillLevelLabel label="Evaluate" color={colors.yellow[500]}>
            <SkillLevel
              courseId={courseId}
              value={skillLevels.evaluate.value}
              bloomLevel="EVALUATE"
            />
          </SkillLevelLabel>
        )}
        {skillLevels.create !== null && skillLevels.create.value > 0 && (
          <SkillLevelLabel label="Create" color={colors.orange[500]}>
            <SkillLevel
              courseId={courseId}
              value={skillLevels.create.value}
              bloomLevel="CREATE"
            />
          </SkillLevelLabel>
        )}
      </div>
    );
  } else {
    return <div></div>;
  }
}

function SkillLevelLabel({
  children,
  label,
  color,
}: {
  children: ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className="relative flex flex-col justify-center items-center gap-1">
      <div
        className="text-gray-800 border-b-2 text-center font-semibold text-[0.62rem]"
        style={{ borderColor: color }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function SkillLevel({
  bloomLevel,
  value,
  courseId,
}: {
  bloomLevel: BloomLevel;
  value: number;
  courseId: string;
}) {
  const level = Math.floor(value * 100); // integer part is level
  const progress = value * 100; // decimal part is progress

  if (level < 50) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={
          <SkillBadge
            color={colors.white}
            level={level}
            progress={progress}
            strokeColor={colors.gray[300]}
            progressColor={colors.gray[400]}
            textColor={colors.gray[600]}
          />
        }
        level="Basic"
        color={colors.gray[400]}
        bloomLevel={bloomLevel}
      />
    );
  } else if (level < 65) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#c0c0c0" level={level} progress={progress} />}
        level="Iron"
        color="#c0c0c0"
        bloomLevel={bloomLevel}
      />
    );
  } else if (level < 75) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#bf8970" level={level} progress={progress} />}
        level="Bronze"
        color="#bf8970"
        bloomLevel={bloomLevel}
      />
    );
  } else if (level < 85) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#d4af37" level={level} progress={progress} />}
        level="Gold"
        color="#d4af37"
        bloomLevel={bloomLevel}
      />
    );
  } else {
    return (
      <SkillLevelBase
        badge={
          <SkillBadge
            color={colors.emerald[600]}
            level={level}
            progress={level >= 95 ? 100 : progress}
          />
        }
        level="Emerald"
        color={colors.emerald[600]}
        bloomLevel={bloomLevel}
        courseId={courseId}
      />
    );
  }
}

export function SkillLevelBase({
  badge,
  level,
  color,
  bloomLevel,
  courseId,
}: {
  badge: ReactNode;
  level: string;
  color: string;
  bloomLevel: BloomLevel;
  courseId: string;
}) {
  // const popperRef = useRef<any>();

  // const suggestions = (
  //   <Suspense fallback={<CircularProgress className="m-2" size="1rem" />}>
  //     <SkillLevelSuggestions
  //       courseId={courseId}
  //       chapterId={chapterId}
  //       bloomLevel={bloomLevel}
  //       color={color}
  //       level={level}
  //       onLoad={(num) => {
  //         if (popperRef.current) popperRef.current.update();
  //       }}
  //     />
  //   </Suspense>
  // );

  return (
    // <Tooltip
    //   title={suggestions}
    //   placement="bottom"
    //   slotProps={{
    //     popper: {
    //       modifiers: [
    //         { name: "offset", options: { offset: [0, -5] } },
    //         { name: "flip", enabled: false },
    //       ],
    //     },
    //   }}
    //   PopperProps={{ popperRef }}
    //   classes={{
    //     tooltip: "!bg-white border !text-gray-800 border-gray-200",
    //   }}
    //   arrow
    // >
    <Box>{badge}</Box>
    // </Tooltip>
  );
}

// function SkillLevelSuggestions({
//   chapterId,
//   bloomLevel,
//   onLoad,
//   courseId,
//   color,
//   level,
// }: {
//   chapterId: string;
//   bloomLevel: bloomLevel;
//   onLoad: (num: number) => void;
//   courseId: string;
//   color: string;
//   level: string;
// }) {
//   const { suggestionsByChapterIds } =
//     useLazyLoadQuery<SkillLevelsSuggestionsQuery>(
//       graphql`
//         query SkillLevelsSuggestionsQuery(
//           $chapterId: UUID!
//           $bloomLevel: bloomLevel!
//         ) {
//           suggestionsByChapterIds(
//             chapterIds: [$chapterId]
//             amount: 3
//             bloomLevels: [$bloomLevel]
//           ) {
//             content {
//               id
//             }
//             ...SuggestionFragment
//           }
//         }
//       `,
//       { chapterId, bloomLevel }
//     );

//   useEffect(
//     () => onLoad(suggestionsByChapterIds.length),
//     [onLoad, suggestionsByChapterIds]
//   );

//   return (
//     <div className="font-normal px-1 py-2">
//       <div className="text-xs text-gray-800 text-center">
//         Level: <span style={{ color }}>{level}</span>
//       </div>
//       <div className="my-2 border-t border-gray-200"></div>
//       {suggestionsByChapterIds.length > 0 ? (
//         <>
//           <div className="text-center font-medium w-full mb-2">
//             Suggestions for improving your score
//           </div>
//           <div className="flex flex-col gap-2 items-start">
//             {suggestionsByChapterIds.map((suggestion) => (
//               <Suggestion
//                 courseId={courseId}
//                 key={suggestion.content.id}
//                 _suggestion={suggestion}
//                 small
//               />
//             ))}
//           </div>
//         </>
//       ) : (
//         <div className="text-center">You are all set.</div>
//       )}
//     </div>
//   );
// }

function SkillBadge({
  level,
  progress,
  color,
  strokeColor,
  progressColor,
  textColor = "white",
}: {
  level: number;
  progress: number;
  color: string;
  strokeColor?: string;
  progressColor?: string;
  textColor?: string;
}) {
  return (
    <div className="relative h-[3.25rem] w-12 flex justify-center select-none">
      <LevelIcon
        className="h-full"
        color={color}
        progress={progress}
        strokeColor={strokeColor}
        progressColor={progressColor}
      />
      <div
        className="absolute inset-0 drop-shadow flex flex-col items-center justify-center"
        style={{ color: textColor }}
      >
        <div className="mt-0.5 text-xs">level</div>
        <div className="-mt-2 font-bold text-lg">{level}</div>
      </div>
    </div>
  );
}

function LevelIcon({
  className = "",
  color,
  strokeColor,
  progressColor,
  progress,
}: {
  className?: string;
  color: string;
  strokeColor?: string;
  progressColor?: string;
  progress: number;
}) {
  return (
    <svg
      className={className}
      width="288.466"
      height="318.02"
      viewBox="0 0 76.323 84.143"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M69.445 60.133c-1.81 3.135-11.893 8.283-15.028 10.093-3.136 1.81-12.635 7.968-16.255 7.968-3.62 0-13.12-6.158-16.255-7.968-3.136-1.81-13.218-6.958-15.028-10.093-1.81-3.136-1.227-14.441-1.227-18.062 0-3.62-.584-14.925 1.227-18.06 1.81-3.136 11.892-8.284 15.028-10.094 3.135-1.81 12.634-7.968 16.255-7.968 3.62 0 13.12 6.157 16.255 7.968 3.135 1.81 13.217 6.958 15.028 10.093 1.81 3.136 1.227 14.44 1.227 18.061 0 3.62.583 14.926-1.227 18.062z"
        fill={color}
        stroke={strokeColor}
      />
      <path
        d="M72.883 62.118c-2.01 3.48-13.2 9.193-16.68 11.203-3.48 2.009-14.023 8.843-18.041 8.843-4.019 0-14.562-6.834-18.042-8.843-3.48-2.01-14.67-7.723-16.68-11.203-2.009-3.48-1.362-16.028-1.362-20.047 0-4.018-.647-16.566 1.362-20.046 2.01-3.48 13.2-9.194 16.68-11.203 3.48-2.01 14.023-8.844 18.042-8.844 4.018 0 14.561 6.835 18.041 8.844 3.48 2.01 14.67 7.723 16.68 11.203 2.01 3.48 1.362 16.028 1.362 20.046 0 4.019.647 16.567-1.362 20.047z"
        fill="none"
        stroke={progressColor ?? strokeColor ?? color}
        strokeWidth="3.9568648"
        strokeDasharray={`${progress},${100 - progress}`}
        strokeDashoffset="33.3333"
        pathLength="100"
      />
    </svg>
  );
}
