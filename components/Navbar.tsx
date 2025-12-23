"use client";

import { NavbarIsTutor$key } from "@/__generated__/NavbarIsTutor.graphql";
import { NavbarSemanticSearchQuery } from "@/__generated__/NavbarSemanticSearchQuery.graphql";
import { NavbarStudentQuery } from "@/__generated__/NavbarStudentQuery.graphql";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import logo from "@/assets/logo.svg";
import StoreIcon from "@mui/icons-material/Store";
import coins from "assets/lottery/coins.png";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import Image from "next/image";
import Link from "next/link";

import { useCurrency } from "@/app/contexts/CurrencyContext";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import ProfilePicAndBorder from "@/components/profile/header/common/ProfilePicAndBorder";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { PageView, usePageView } from "@/src/currentView";
import { useAITutorStore } from "@/stores/aiTutorStore";

import {
  CollectionsBookmark,
  Dashboard,
  Logout,
  ManageSearch,
  Notifications,
  Search,
  Settings,
} from "@mui/icons-material";

import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type {
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";

import { chain, debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";

import { NavbarNotificationsQuery } from "@/__generated__/NavbarNotificationsQuery.graphql";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useAuth } from "react-oidc-context";
import {
  fetchQuery,
  graphql,
  useFragment,
  useLazyLoadQuery,
  useRelayEnvironment,
  useSubscription,
} from "react-relay";
import LegalMiniBar from "./LegalMiniBar";
import NotificationsWithArrow from "./navbar/notifications/NotificationsWithArrow";

const NAVBAR_NOTIFICATIONS_QUERY = graphql`
  query NavbarNotificationsQuery {
    currentUserInfo {
      id
      notificationUnreadCount
      notifications {
        id
        title
        description
        href
        createdAt
        read
      }
    }
  }
`;

const NAVBAR_NOTIFICATION_ADDED_SUB = graphql`
  subscription NavbarNotificationAddedSubscription($userId: UUID!) {
    notificationAdded(userId: $userId) {
      id
      title
      description
      href
      createdAt
      read
    }
  }
`;

/** ---------------- Utilities ---------------- */
function useIsTutor(_frag: NavbarIsTutor$key) {
  const data = useFragment(
    graphql`
      fragment NavbarIsTutor on UserInfo {
        realmRoles
        courseMemberships {
          role
        }
      }
    `,
    _frag
  );
  const realmRoles = Array.isArray(data?.realmRoles) ? data.realmRoles : [];
  const courseMemberships = Array.isArray(data?.courseMemberships)
    ? data.courseMemberships
    : [];
  return (
    realmRoles.includes("SUPER_USER") ||
    realmRoles.includes("COURSE_CREATOR") ||
    courseMemberships.some(
      (x) => x && (x.role === "TUTOR" || x.role === "ADMINISTRATOR")
    )
  );
}

type SearchResultType = {
  breadcrumbs: string;
  title: string;
  position?: string;
  url: string;
};

/** ---------------- Navbar Shell ---------------- */
function NavbarBase({
  children,
  tutor,
  userId,
}: {
  children: React.ReactNode;
  tutor: boolean;
  userId: string;
}) {
  const [term, setTerm] = useState("");
  const router = useRouter();

  const searchResults = useLazyLoadQuery<NavbarSemanticSearchQuery>(
    graphql`
      query NavbarSemanticSearchQuery($term: String!, $skip: Boolean!) {
        semanticSearch(queryText: $term, count: 30) @skip(if: $skip) {
          score
          ... on AssessmentSemanticSearchResult {
            assessmentId
            score
            assessment {
              ... on FlashcardSetAssessment {
                metadata {
                  name
                  courseId
                  course {
                    title
                  }
                }
                __typename
              }
              ... on QuizAssessment {
                metadata {
                  name
                  courseId
                  course {
                    title
                  }
                }
                __typename
              }
            }
          }
          ... on MediaRecordSegmentSemanticSearchResult {
            mediaRecordSegment {
              __typename
              ... on VideoRecordSegment {
                startTime
                mediaRecord {
                  id
                  name
                  contents {
                    id
                    metadata {
                      name
                      course {
                        id
                        title
                      }
                    }
                  }
                }
              }
              ... on DocumentRecordSegment {
                page
                mediaRecord {
                  id
                  name
                  contents {
                    id
                    metadata {
                      name
                      course {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { term: term, skip: term.length < 3 }
  );

  const [isPending, startTransition] = useTransition();

  const debouncedSetter = useCallback(
    debounce((value: string) => startTransition(() => setTerm(value)), 150),
    [setTerm, startTransition]
  );

  const results: SearchResultType[] = chain(searchResults.semanticSearch ?? [])
    .orderBy((x: any) => x?.score)
    .slice(0, 15)
    .flatMap((x: any): SearchResultType[] => {
      if (
        x.mediaRecordSegment &&
        x.mediaRecordSegment.__typename === "DocumentRecordSegment"
      ) {
        const seg = x.mediaRecordSegment;
        return seg.mediaRecord.contents.filter(Boolean).map((content: any) => ({
          breadcrumbs: `${content!.metadata.course.title} › ${
            content!.metadata.name
          }`,
          title: seg.mediaRecord.name,
          position: `Page ${seg.page + 1}`,
          url: `/courses/${content!.metadata.course.id}/media/${
            content!.id
          }?selectedDocument=${seg.mediaRecord.id}&page=${seg.page + 1}`,
        }));
      } else if (
        x.mediaRecordSegment &&
        x.mediaRecordSegment.__typename === "VideoRecordSegment"
      ) {
        const seg = x.mediaRecordSegment;
        return seg.mediaRecord.contents.filter(Boolean).map((content: any) => ({
          breadcrumbs: `${content!.metadata.course.title} › ${
            content!.metadata.name
          }`,
          title: seg.mediaRecord.name,
          position: dayjs
            .duration(seg.startTime ?? 0, "seconds")
            .format("HH:mm:ss"),
          url: `/courses/${content!.metadata.course.id}/media/${
            content!.id
          }?selectedVideo=${seg.mediaRecord.id}&videoPosition=${seg.startTime}`,
        }));
      } else if (
        x.assessment &&
        x.assessment.__typename === "FlashcardSetAssessment"
      ) {
        return [
          {
            breadcrumbs: `${x.assessment.metadata.course.title}`,
            title: x.assessment.metadata.name,
            url: `/courses/${x.assessment.metadata.courseId}/flashcards/${x.assessmentId}`,
          },
        ];
      } else if (x.assessment && x.assessment.__typename === "QuizAssessment") {
        return [
          {
            breadcrumbs: `${x.assessment.metadata.course.title}`,
            title: x.assessment.metadata.name,
            url: `/courses/${x.assessment.metadata.courseId}/flashcards/${x.assessmentId}`,
          },
        ];
      } else {
        return [];
      }
    })
    .value() as SearchResultType[];

  const [isSearchPopupOpen, setSearchPopupOpen] = useState(false);
  function SearchPopupPaper({ children }: { children?: any }) {
    return (
      <ClickAwayListener onClickAway={() => setSearchPopupOpen(false)}>
        <Paper>
          {children}
          <Button
            startIcon={<ManageSearch />}
            onClick={() => {
              router.push(`/search?query=${term}`);
              setSearchPopupOpen(false);
            }}
          >
            Detailed results
          </Button>
        </Paper>
      </ClickAwayListener>
    );
  }

  return (
    <Box marginBottom={6}>
      <div className="shrink-0 bg-slate-200 h-full px-8 flex flex-col gap-6 w-72 xl:w-96 overflow-auto thin-scrollbar">
        <div className="text-center mt-8 text-3xl font-medium tracking-wider sticky">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} alt="GITS logo" className="w-24 m-auto" />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#089CDC",
              marginTop: "4px",
              textAlign: "center",
            }}
          >
            MEITREX
          </Typography>
        </div>
        <UserInfo tutor={tutor} userId={userId} />
        <NavbarSection>
          <Autocomplete<SearchResultType, false, false, true>
            freeSolo
            size="small"
            className="mx-2 mb-2"
            clearOnBlur
            blurOnSelect
            autoHighlight
            open={isSearchPopupOpen}
            value={null}
            getOptionLabel={(x) => (typeof x === "string" ? x : x?.title ?? "")}
            onChange={(_, newVal) => {
              if (typeof newVal == "string") {
                router.push(`/search?query=${newVal}`);
              } else if (newVal) {
                setSearchPopupOpen(false);
                router.push(newVal.url);
              }
            }}
            filterOptions={(x) => x}
            renderOption={(
              props,
              option,
              _state: AutocompleteRenderOptionState,
              _owner: AutocompleteOwnerState<any, any, any, any>
            ) => (
              <li {...props}>
                <div>
                  <div className="text-[10px] text-slate-500">
                    {option.breadcrumbs}
                  </div>
                  {option.title}
                  {option.position && (
                    <div className="text-[10px] text-slate-400">
                      {option.position}
                    </div>
                  )}
                </div>
              </li>
            )}
            options={
              term.length >= 3
                ? (results as SearchResultType[])
                : ([] as SearchResultType[])
            }
            onInputChange={(_, value) => value && debouncedSetter(value)}
            renderInput={(params): React.ReactNode => (
              <TextField
                {...params}
                onClick={() => setSearchPopupOpen(true)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start" className="ml-0.5">
                      {isPending ? <CircularProgress size={24} /> : <Search />}
                    </InputAdornment>
                  ),
                }}
              />
            )}
            PaperComponent={SearchPopupPaper}
          />
          <NavbarLink title="Dashboard" icon={<Dashboard />} href="/" exact />
          <NavbarLink
            title="Course Catalog"
            icon={<CollectionsBookmark />}
            href="/courses"
            exact
          />
          <GamificationGuard>
            <NavbarLink
              title="Items"
              icon={<StoreIcon />}
              href="/items"
              exact
            />
          </GamificationGuard>
        </NavbarSection>

        {children}
      </div>
    </Box>
  );
}

/** ---------------- Reusable Section ---------------- */
function NavbarSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="bg-white rounded-lg">
      <List
        subheader={
          title ? (
            <ListSubheader component="div" disableSticky className="rounded-lg">
              {title}
            </ListSubheader>
          ) : null
        }
      >
        {children}
      </List>
    </div>
  );
}

function NavbarLink({
  icon,
  title,
  href,
  exact,
}: {
  icon?: ReactElement;
  title: string;
  href: string;
  exact?: boolean;
}) {
  const router = useRouter();
  const currentPath = usePathname();

  const isActive = exact ? currentPath == href : currentPath.startsWith(href);
  return (
    <div
      className={`relative ${
        isActive ? "bg-gradient-to-r from-gray-100 to-transparent" : ""
      }`}
    >
      {isActive && (
        <div className="absolute w-2 inset-y-0 -left-2 bg-sky-800 rounded-l"></div>
      )}
      <ListItemButton onClick={() => router.push(href)}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={title} />
      </ListItemButton>
    </div>
  );
}

function SwitchPageViewButton(): JSX.Element | null {
  const [pageView, setPageView] = usePageView();

  switch (pageView) {
    case PageView.Student:
      return (
        <ListItemButton onClick={() => setPageView(PageView.Lecturer)}>
          <ListItemText primary="Switch to lecturer view" />
        </ListItemButton>
      );
    case PageView.Lecturer:
      return (
        <ListItemButton onClick={() => setPageView(PageView.Student)}>
          <ListItemText primary="Switch to student view" />
        </ListItemButton>
      );
    default:
      return null;
  }
}

function UserInfo({ tutor, userId }: { tutor: boolean; userId: string }) {
  const auth = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const clearChat = useAITutorStore((s) => s.clearChat);
  const { points } = useCurrency();
  const notifData = useLazyLoadQuery<NavbarNotificationsQuery>(
    NAVBAR_NOTIFICATIONS_QUERY,
    {},
    { fetchPolicy: "store-and-network" }
  );

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const list = notifData?.currentUserInfo?.notifications ?? [];
    setNotifications([...list]);
  }, [notifData]);

  useSubscription({
    subscription: NAVBAR_NOTIFICATION_ADDED_SUB,
    variables: { userId },
    onNext: (ev: any) => {
      const n = ev?.notificationAdded;
      if (!n) return;
      setNotifications((prev) => [n, ...prev]);
    },
  });

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  // Inventory/profile picture (from origin/main)
  const { inventoryForUser } =
    useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
      widgetApiItemInventoryForUserQuery,
      { fetchPolicy: "network-only" }
    );
  const profilePic = getUnlockedItemAndEquiped(inventoryForUser, "profilePics");
  const profilePicFrame = getUnlockedItemAndEquiped(
    inventoryForUser,
    "profilePicFrames"
  );

  // XP/Level (keeps your HEAD logic)
  const [levelInfo, setLevelInfo] = useState<{
    level: number;
    xpInLevel: number;
    xpRequiredForLevelUp: number;
  } | null>(null);

  // central XP fetcher (Relay)
  const relayEnv = useRelayEnvironment();
  const fetchXP = useCallback(async () => {
    if (!userId) return;
    try {
      const query = graphql`
        query NavbarGetUserXPQuery($userID: ID!) {
          getUser(userID: $userID) {
            refUserID
            name
            email
            xpValue
            requiredXP
            exceedingXP
            level
          }
        }
      `;
      const levelData = await fetchQuery(relayEnv, query, {
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
      console.error("[Navbar XP] fetch failed", e);
      setLevelInfo({ level: 0, xpInLevel: 0, xpRequiredForLevelUp: 1 });
    }
  }, [relayEnv, userId]);

  // initial fetch and on identity changes
  useEffect(() => {
    fetchXP();
  }, [fetchXP]);

  // refresh when window regains focus / becomes visible / custom XP events fire
  useEffect(() => {
    const handleFocus = () => fetchXP();
    const handleVisible = () => {
      if (document.visibilityState === "visible") fetchXP();
    };
    const handleCustom = () => fetchXP(); // dispatch window.dispatchEvent(new Event('xp:updated')) elsewhere

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

  // If UI shows a full bar (xp >= required), poll a few times to pick up backend level-up
  const xpRetryRef = useRef(0);
  useEffect(() => {
    if (!levelInfo) return;
    // Recompute progress correctly from exceedingXP (xpInLevel) and requiredXP (remaining)
    const remaining = Math.max(0, levelInfo.xpRequiredForLevelUp ?? 0);
    const gained = Math.max(0, levelInfo.xpInLevel ?? 0);
    const total = Math.max(1, Math.round(gained + remaining));
    const perc = Math.round((gained / total) * 100);

    if ((remaining <= 0 || perc >= 100) && xpRetryRef.current < 3) {
      xpRetryRef.current += 1;
      const t = setTimeout(() => fetchXP(), 1200);
      return () => clearTimeout(t);
    }
    // reset retries once things look normal
    xpRetryRef.current = 0;
  }, [levelInfo, fetchXP]);

  const level = levelInfo?.level ?? 0;
  const xpInLevel = levelInfo?.xpInLevel ?? 0; // exceedingXP
  const xpRemaining = Math.max(0, levelInfo?.xpRequiredForLevelUp ?? 0); // requiredXP (rest to level-up)
  const xpTotalThisLevel = Math.max(1, Math.round(xpInLevel + xpRemaining));
  const percent = Math.max(
    0,
    Math.min(100, Math.round((Math.max(0, xpInLevel) / xpTotalThisLevel) * 100))
  );
  const fmtInt = (n: number) =>
    Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  // Compact formatter for points (currency)
  const compactPoints = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(points ?? 0);

  const levelIconFor = (lvl: number) => {
    const n = Math.max(0, Math.min(99, Math.round(lvl || 0)));
    return `/levels/level_${n}.svg`;
    // This matches your profile logic so Level 0 shows correctly.
  };
  const [levelIconSrc, setLevelIconSrc] = useState<string>(levelIconFor(level));
  useEffect(() => {
    setLevelIconSrc(levelIconFor(level));
  }, [level]);

  return (
    <div className="sticky bottom-0 -mt-3 bg-gradient-to-t from-slate-200 from-75% to-transparent">
      <NavbarSection>
        {/* Top row: avatar + name + settings + logout */}
        <ListItem
          secondaryAction={
            <>
              <Tooltip title="Notifications" placement="left">
                <IconButton onClick={handleOpenNotifications}>
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                    overlap="circular"
                    sx={{
                      zIndex: 2,
                    }}
                  >
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings" placement="left">
                <Link href="/settings/notification">
                  <IconButton>
                    <Settings />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title="Logout" placement="left">
                <IconButton
                  edge="end"
                  aria-label="logout"
                  onClick={() => {
                    sessionStorage.clear();
                    window.localStorage.removeItem("meitrex-welcome-shown");
                    clearChat();
                    auth.signoutRedirect({
                      post_logout_redirect_uri:
                        process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ??
                        "http://localhost:3005",
                    });
                  }}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            </>
          }
        >
          <GamificationGuard>
            <ListItemAvatar>
              <Link href={"/profile"}>
                <ProfilePicAndBorder
                  height={50}
                  profilePicFrame={profilePicFrame}
                  profilePic={profilePic}
                />
              </Link>
            </ListItemAvatar>
          </GamificationGuard>
          <Link href={"/profile"}>
            <ListItemText primary={auth.user?.profile?.name} />
          </Link>
        </ListItem>

        <GamificationGuard>
          <Divider />
        </GamificationGuard>

        {/* XP/Level + Currency row */}
        <GamificationGuard>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              pt: 0.75,
              pb: 0.75,
              px: 2,
            }}
          >
            {/* Level Icon */}
            <img
              src={levelIconSrc}
              alt={`Level ${level} icon`}
              width={50}
              height={50}
              style={{ display: "block" }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                // fallback chain to ensure an icon displays
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

            {/* Progress + text + coin chip (vertical stack) */}
            <Box
              sx={{
                flexGrow: 1,
                mx: 1,
                minWidth: 160,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 8, borderRadius: 999, width: "100%" }}
              />
              <Typography variant="caption" sx={{ mt: 0.25, display: "block" }}>
                {levelInfo
                  ? `${fmtInt(xpInLevel)} / ${fmtInt(xpTotalThisLevel)} XP`
                  : "Loading XP…"}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                <Chip
                  size="small"
                  color="secondary"
                  label={
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {compactPoints}
                      <Image src={coins} alt="Coins" width={18} height={18} />
                    </Box>
                  }
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Box>
          </Box>
        </GamificationGuard>
        {tutor && (
          <>
            <Divider />
            <SwitchPageViewButton />
          </>
        )}
        <NotificationsWithArrow
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          setNotifications={setNotifications}
          notifications={notifications}
        />
      </NavbarSection>
    </div>
  );
}

/** ---------------- Public Navbar Component ---------------- */
export function Navbar() {
  const [pageView] = usePageView();

  const { currentUserInfo } = useLazyLoadQuery<NavbarStudentQuery>(
    graphql`
      query NavbarStudentQuery {
        currentUserInfo {
          ...NavbarIsTutor
          id
          realmRoles
          courseMemberships {
            role
            course {
              id
              title
              startDate
              endDate
              published
            }
          }
        }
      }
    `,
    {}
  );

  const memberships = currentUserInfo?.courseMemberships ?? [];
  const filtered = memberships
    .filter(
      (x) =>
        ["ADMINISTRATOR", "TUTOR"].includes(x.role) ||
        pageView === PageView.Student
    )
    .filter((x) => x.course.published || pageView === PageView.Lecturer)
    .filter(
      (x) =>
        (dayjs(x.course.endDate) >= dayjs() &&
          dayjs(x.course.startDate) <= dayjs()) ||
        pageView === PageView.Lecturer
    );

  const tutor = useIsTutor(currentUserInfo);

  return (
    <>
      <NavbarBase tutor={tutor} userId={currentUserInfo.id}>
        {filtered.length > 0 ? (
          <NavbarSection
            title={
              pageView === PageView.Lecturer
                ? "Courses I'm teaching this semester"
                : "Courses I'm attending this semester"
            }
          >
            {filtered.map(({ course }) => (
              <NavbarLink
                key={course.id}
                title={course.title}
                href={`/courses/${course.id}`}
              />
            ))}
          </NavbarSection>
        ) : null}
      </NavbarBase>
      <LegalMiniBar />
    </>
  );
}
