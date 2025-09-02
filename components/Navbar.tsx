"use client";
import { NavbarIsTutor$key } from "@/__generated__/NavbarIsTutor.graphql";
import { NavbarSemanticSearchQuery } from "@/__generated__/NavbarSemanticSearchQuery.graphql";
import { NavbarStudentQuery } from "@/__generated__/NavbarStudentQuery.graphql";
import logo from "@/assets/logo.svg";
import StoreIcon from "@mui/icons-material/Store";
import coins from "assets/lottery/coins.png";
import duration from "dayjs/plugin/duration";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(duration);

import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import ProfilePicAndBorder from "@/components/profile/header/common/ProfilePicAndBorder";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { PageView, usePageView } from "@/src/currentView";
import {
  CollectionsBookmark,
  Dashboard,
  Logout,
  ManageSearch,
  Search,
  Settings,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
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
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import { chain, debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { ReactElement, useCallback, useState, useTransition } from "react";
import { useAuth } from "react-oidc-context";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

function useIsTutor(_frag: NavbarIsTutor$key) {
  const { realmRoles, courseMemberships } = useFragment(
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
  return (
    realmRoles.includes("SUPER_USER") ||
    realmRoles.includes("COURSE_CREATOR") ||
    courseMemberships.some(
      (x) => x.role === "TUTOR" || x.role === "ADMINISTRATOR"
    )
  );
}

type SearchResultType = {
  breadcrumbs: string;
  title: string;
  position?: string;
  url: string;
};

function NavbarBase({
  children,
  _isTutor,
}: {
  children: React.ReactElement;
  _isTutor: NavbarIsTutor$key;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetter = useCallback(
    debounce((value: string) => startTransition(() => setTerm(value)), 150),
    [setTerm, startTransition]
  );

  const results = chain(searchResults.semanticSearch)
    .orderBy((x) => x?.score)
    .slice(0, 15)
    .flatMap((x): SearchResultType[] => {
      if (
        x.mediaRecordSegment &&
        x.mediaRecordSegment.__typename === "DocumentRecordSegment"
      ) {
        const seg = x.mediaRecordSegment;
        return seg.mediaRecord.contents
          .filter((x) => !!x)
          .map((content) => ({
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
        return seg.mediaRecord.contents
          .filter((x) => !!x)
          .map((content) => ({
            breadcrumbs: `${content!.metadata.course.title} › ${
              content!.metadata.name
            }`,
            title: seg.mediaRecord.name,
            position: dayjs
              .duration(seg.startTime ?? 0, "seconds")
              .format("HH:mm:ss"),
            url: `/courses/${content!.metadata.course.id}/media/${
              content!.id
            }?selectedVideo=${seg.mediaRecord.id}&videoPosition=${
              seg.startTime
            }`,
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
    .value();

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

      <NavbarSection>
        <Autocomplete
          freeSolo
          size="small"
          className="mx-2 mb-2"
          clearOnBlur
          blurOnSelect
          autoHighlight
          open={isSearchPopupOpen}
          value={null}
          getOptionLabel={(x) => ""}
          onChange={(_, newVal) => {
            if (typeof newVal == "string") {
              router.push(`/search?query=${newVal}`);
            } else if (newVal) {
              setSearchPopupOpen(false);
              router.push(newVal.url);
            }
          }}
          filterOptions={(x) => x}
          renderOption={(props, option) => (
            <li {...props} key={option?.breadcrumbs}>
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
          options={term.length >= 3 ? results ?? [] : []}
          onInputChange={(_, value) => value && debouncedSetter(value)}
          renderInput={(params) => (
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
        <NavbarLink title="Items" icon={<StoreIcon />} href="/items" exact />
      </NavbarSection>
      {children}
      <UserInfo _isTutor={_isTutor} />
    </div>
  );
}

function NavbarSection({ children, title }: { children: any; title?: string }) {
  return (
    <div className="bg-white rounded-lg">
      <List
        subheader={
          title ? (
            <ListSubheader className="rounded-lg">{title}</ListSubheader>
          ) : undefined
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
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={title} />
      </ListItemButton>
    </div>
  );
}

function SwitchPageViewButton() {
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
  }
}

function UserInfo({ _isTutor }: { _isTutor: NavbarIsTutor$key }) {
  const auth = useAuth();
  const { points } = useCurrency();
  const tutor = useIsTutor(_isTutor);

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

  return (
    <div className="sticky bottom-0 py-6 -mt-6 bg-gradient-to-t from-slate-200 from-75% to-transparent">
      <NavbarSection>
        <ListItem
          secondaryAction={
            <Tooltip title="Logout" placement="left">
              <IconButton
                edge="end"
                aria-label="logout"
                onClick={() => {
                  window.localStorage.removeItem("meitrex-welcome-shown");
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
          }
        >
          <ListItemAvatar>
            <Link href={"/profile"}>
              <ProfilePicAndBorder
                height={50}
                profilePicFrame={profilePicFrame}
                profilePic={profilePic}
              />
            </Link>
          </ListItemAvatar>
          <ListItemText primary={auth.user?.profile?.name} />
          <Tooltip title="Settings" placement="left">
            <Link href="/settings/gamification">
              <IconButton>
                <Settings />
              </IconButton>
            </Link>
          </Tooltip>
        </ListItem>
        <Divider />
        <Box
          sx={{
            width: "100%",
            height: "100%", // oder z. B. "200px" oder "calc(100vh - 64px)"
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <Chip
            color="secondary"
            label={
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {points}
                <Image src={coins} alt="Coins" width={18} height={18} />
              </Box>
            }
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        {tutor && (
          <>
            <Divider />
            <SwitchPageViewButton />
          </>
        )}
      </NavbarSection>
    </div>
  );
}

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

  const filtered = currentUserInfo.courseMemberships
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

  return (
    <NavbarBase _isTutor={currentUserInfo}>
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
      ) : (
        <></>
      )}
    </NavbarBase>
  );
}
