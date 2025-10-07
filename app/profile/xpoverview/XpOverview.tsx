import { Box, Stack, Typography, LinearProgress } from "@mui/material";
import { graphql } from "relay-runtime";
import { useLazyLoadQuery } from "react-relay";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRelayEnvironment, fetchQuery } from "react-relay";
//import { pagePrivateProfileStudentGeneral_GetUserXPQuery } from "@/__generated__/pagePrivateProfileStudentGeneral_GetUserXPQuery.graphql";

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
  const [levelInfo, setLevelInfo] = useState<{
    level: number;
    xpInLevel: number;
    xpRequiredForLevelUp: number;
  } | null>(null);

  const relayEnv = useRelayEnvironment();

  const fetchXP = useCallback(async () => {
    if (!userId) return;
    try {
      const levelData = await fetchQuery(relayEnv, getUserXPQuery, {
        userID: userId,
      }).toPromise();

      const rawUser = (levelData as any)?.getUser;
      const payload: any = Array.isArray(rawUser)
        ? rawUser[0] ?? null
        : rawUser ?? null;

      if (!payload) {
        setLevelInfo({ level: 0, xpInLevel: 0, xpRequiredForLevelUp: 1 });
        return;
      }

      const requiredXP = Number(payload.requiredXP ?? 0);
      const exceedingXP = Number(payload.exceedingXP ?? 0);
      const level = Number(payload.level ?? 0);

      setLevelInfo({
        level: Number.isFinite(level) ? level : 0,
        xpInLevel: Number.isFinite(exceedingXP) ? exceedingXP : 0,
        xpRequiredForLevelUp:
          Number.isFinite(requiredXP) && requiredXP > 0 ? requiredXP : 1,
      });
    } catch (e) {
      console.error("[XP Overview] fetch failed", e);
      setLevelInfo({ level: 0, xpInLevel: 0, xpRequiredForLevelUp: 1 });
    }
  }, [relayEnv, userId]);

  // Initial fetch
  useEffect(() => {
    fetchXP();
  }, [fetchXP]);

  // Refresh on focus/visibility/custom events
  useEffect(() => {
    const handleFocus = () => fetchXP();
    const handleVisible = () => {
      if (document.visibilityState === "visible") fetchXP();
    };
    const handleCustom = () => fetchXP();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("xp:updated", handleCustom as EventListener);
    window.addEventListener(
      "meitrex:xp-updated",
      handleCustom as EventListener
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("xp:updated", handleCustom as EventListener);
      window.removeEventListener(
        "meitrex:xp-updated",
        handleCustom as EventListener
      );
    };
  }, [fetchXP]);

  // Retry logic when XP bar appears full
  const xpRetryRef = useRef(0);
  useEffect(() => {
    if (!levelInfo) return;

    const remaining = Math.max(0, levelInfo.xpRequiredForLevelUp ?? 0);
    const gained = Math.max(0, levelInfo.xpInLevel ?? 0);
    const total = Math.max(1, Math.round(gained + remaining));
    const perc = Math.round((gained / total) * 100);

    if ((remaining <= 0 || perc >= 100) && xpRetryRef.current < 3) {
      xpRetryRef.current += 1;
      const t = setTimeout(() => fetchXP(), 1200);
      return () => clearTimeout(t);
    }

    xpRetryRef.current = 0;
  }, [levelInfo, fetchXP]);

  // Calculate display values (exactly like Navbar)
  const level = levelInfo?.level ?? 0;
  const xpInLevel = levelInfo?.xpInLevel ?? 0; // exceedingXP
  const xpRemaining = Math.max(0, levelInfo?.xpRequiredForLevelUp ?? 0); // requiredXP
  const xpTotalThisLevel = Math.max(1, Math.round(xpInLevel + xpRemaining));
  const percent = Math.max(
    0,
    Math.min(100, Math.round((Math.max(0, xpInLevel) / xpTotalThisLevel) * 100))
  );

  const fmtInt = (n: number) =>
    Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const levelIconFor = (lvl: number) => {
    const n = Math.max(0, Math.min(99, Math.round(lvl || 0)));
    return `/levels/level_${n}.svg`;
  };

  const [levelIconSrc, setLevelIconSrc] = useState<string>(levelIconFor(level));

  useEffect(() => {
    setLevelIconSrc(levelIconFor(level));
  }, [level]);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <img
          src={levelIconSrc}
          alt={`Level ${level}`}
          width={48}
          height={48}
          style={{ display: "block" }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (!levelIconSrc.endsWith("level_0.svg")) {
              setLevelIconSrc("/levels/level_0.svg");
              return;
            }
            if (!levelIconSrc.endsWith("level_1.svg")) {
              setLevelIconSrc("/levels/level_1.svg");
              return;
            }
            el.style.display = "none";
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {levelInfo
            ? `Level ${level} · ${fmtInt(xpInLevel)} / ${fmtInt(
                xpTotalThisLevel
              )} XP`
            : "Loading XP…"}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{ height: 10, borderRadius: 999 }}
      />
    </Box>
  );
}
