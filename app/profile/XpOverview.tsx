import { Box, Stack, Typography, LinearProgress } from "@mui/material";
import { graphql } from "relay-runtime";
import { useLazyLoadQuery } from "react-relay";
import { useMemo } from "react";
import { pagePrivateProfileStudentGeneral_GetUserXPQuery } from "@/__generated__/pagePrivateProfileStudentGeneral_GetUserXPQuery.graphql";

const getUserXPQuery = graphql`
  query XpOverview_GetUserXPQuery($userID: ID!) {
    getUser(userID: $userID) {
      id
      xpValue
      requiredXP
      exceedingXP
      level
    }
  }
`;

type Props = {
  userId: string;
};

export default function XpOverview({ userId }: Props) {
  const xpData =
    useLazyLoadQuery<pagePrivateProfileStudentGeneral_GetUserXPQuery>(
      getUserXPQuery,
      { userID: userId },
      { fetchPolicy: "network-only" }
    );

  const levelInfo = useMemo(() => {
    const payload: any = xpData?.getUser;
    const u = Array.isArray(payload) ? payload[0] : payload;
    return {
      level: Number(u?.level ?? 0),
      requiredXP: Math.max(1, Math.round(Number(u?.requiredXP ?? 1))),
      exceedingXP: Math.max(0, Math.round(Number(u?.exceedingXP ?? 0))),
    };
  }, [xpData]);

  const levelIconSrc = useMemo(() => {
    const lvl = Math.max(0, Math.min(99, levelInfo.level));
    return `/levels/level_${String(lvl)}.svg`;
  }, [levelInfo.level]);

  const progressPct = useMemo(() => {
    const required = Math.max(1, levelInfo.requiredXP);
    const have = Math.max(0, levelInfo.exceedingXP);
    return Math.max(0, Math.min(100, Math.round((have / required) * 100)));
  }, [levelInfo.requiredXP, levelInfo.exceedingXP]);

  const xpTotalThisLevel = Math.max(
    1,
    Math.round(levelInfo.exceedingXP + levelInfo.requiredXP)
  );
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <img
          src={levelIconSrc}
          alt={`Level ${levelInfo.level}`}
          width={48}
          height={48}
          style={{ display: "block" }}
        />
        <Typography variant="body2" color="text.secondary">
          {`Level ${levelInfo.level} · ${Math.round(
            levelInfo.exceedingXP
          )} / ${xpTotalThisLevel} XP`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{ height: 10, borderRadius: 999 }}
      />
    </Box>
  );
}
