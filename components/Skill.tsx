import { SkillFragment$key } from "@/__generated__/SkillFragment.graphql";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import colors from "tailwindcss/colors";
import { Suggestion } from "./Suggestion";
function stringToColor(string: String) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}
export function Skill({
  _skill
}: {
  _skill: SkillFragment$key;
}) {
  const { skillName, skillLevels } = useFragment(
    graphql`
      fragment SkillFragment on Skill {
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
          evaluate{
            value
          }
          create{
            value
          }
        }
      }
    `,
    _skill
  );
  if (skillLevels) {
    const levels = (
      <Suspense fallback={<CircularProgress className="m-2" size="1rem" />}>
        {skillLevels.remember !== null && skillLevels.remember.value > 0 && (
          <SkillLevel label="Remember" value={skillLevels.remember.value} />
        )}
        {skillLevels.understand !== null && skillLevels.understand.value > 0 && (
          <SkillLevel label="Understand" value={skillLevels.understand.value} />
        )}
        {skillLevels.apply !== null && skillLevels.apply.value > 0 && (
          <SkillLevel label="Apply" value={skillLevels.apply.value} />
        )}
        {skillLevels.analyze !== null && skillLevels.analyze.value > 0 && (
          <SkillLevel label="Analyze" value={skillLevels.analyze.value} />
        )}
        {skillLevels.evaluate !== null && skillLevels.evaluate.value > 0 && (
          <SkillLevel label="Evaluate" value={skillLevels.evaluate.value} />
        )}
        {skillLevels.create !== null && skillLevels.create.value > 0 && (
          <SkillLevel label="Create" value={skillLevels.create.value} />
        )}  </Suspense>);
    interface HexagonProps {
      color: string;
      name: string;
    }
    const Hexagon: React.FC<HexagonProps> = ({ color, name }) => {
      return (
        <svg viewBox="0 0 100 100" width="100" height="100" style={{ margin: '10' }} xmlns="http://www.w3.org/2000/svg">
          <polygon points="50 1 95 25 95 75 50 99 5 75 5 25" fill={color} />
          <text x="50" y="50" textAnchor="middle" dy=".3em" fill="white">{name}</text>
        </svg>
      )
    };
    return (
      <Tooltip title={levels} placement="bottom">
        <span>
          <Hexagon color={stringToColor(skillName)} name={skillName} />
        </span>

      </Tooltip>

    );
  } else {
    return null; // or some default JSX
  }
}
function SkillLevel({
  label,
  value,
}: {
  label: string;
  value: number;
}
) {
  return (
    <div>{label}:{value}</div>
  );

}