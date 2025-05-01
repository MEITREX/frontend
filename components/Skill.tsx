import { SkillFragment$key } from "@/__generated__/SkillFragment.graphql";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import colors from "tailwindcss/colors";
import { Suggestion } from "./Suggestion";

export function stringToColor(string: String): string {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}
function getReadableTextColor(backgroundColor: String) {
  const hex = backgroundColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#000000" : "#FFFFFF";
}

export function Skill({ _skill }: { _skill: SkillFragment$key }) {
  const { skillName, skillCategory, skillLevels } = useFragment(
    graphql`
      fragment SkillFragment on Skill {
        skillName
        skillCategory
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
    const levels = (
      <Suspense fallback={<CircularProgress className="m-2" size="1rem" />}>
        {skillLevels.remember !== null && skillLevels.remember.value > 0 && (
          <SkillLevel label="Remember" value={skillLevels.remember.value} />
        )}
        {skillLevels.understand !== null &&
          skillLevels.understand.value > 0 && (
            <SkillLevel
              label="Understand"
              value={skillLevels.understand.value}
            />
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
        )}{" "}
      </Suspense>
    );
    const HexBadge = ({ skillName, skillCategory }: { skillName: string; skillCategory: string }) => (
      <LightTooltip
        title={
        <>
          <p><strong> {skillCategory + ": "} </strong></p>
          <p><strong> {skillName} </strong></p>
        </>
        }
        placement="top"
      >        
      <Box
        sx={{
          width: 85,
          height: 90,
          backgroundColor: stringToColor(skillName + skillCategory),
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          mx: "auto",
          my: "auto",
          padding: "1px",
        }}
      >
        <Typography variant="body2" sx={{
          color: getReadableTextColor(stringToColor(skillName + skillCategory)),
          fontSize: 13,
          fontWeight: "450",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}>
          {skillName}
        </Typography>
      </Box>
    </LightTooltip>
    );
    return (
      <Tooltip title={levels} placement="bottom">
        <span>
          <HexBadge skillName={skillName} skillCategory={skillCategory} />
        </span>
      </Tooltip>
    );
  } else {
    return null; // or some default JSX
  }
}
function SkillLevel({ label, value }: { label: string; value: number }) {
  return (
    <div>
      {label}:{value}
    </div>
  );
}
