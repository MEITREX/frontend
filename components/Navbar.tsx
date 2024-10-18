"use client";
import { NavbarIsTutor$key } from "@/__generated__/NavbarIsTutor.graphql";
import { NavbarSemanticSearchQuery } from "@/__generated__/NavbarSemanticSearchQuery.graphql";
import { NavbarStudentQuery } from "@/__generated__/NavbarStudentQuery.graphql";
import logo from "@/assets/logo.svg";
import { PageView, usePageView } from "@/src/currentView";
import {
  CollectionsBookmark,
  Dashboard,
  Logout,
  ManageSearch,
  Search,
} from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Button,
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
        semanticSearch(queryText: $term, count: 5) @skip(if: $skip) {
          score
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
    .flatMap((x) => {
      const seg = x.mediaRecordSegment;

      return seg.__typename !== "%other"
        ? seg?.mediaRecord?.contents.map((content) => ({
            content,
            ...x,
            mediaRecordSegment: seg,
          }))
        : [];
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
      <div className="text-center my-16 text-3xl font-medium tracking-wider sticky">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt="GITS logo" className="w-24 m-auto" />
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
          onChange={(x, newVal) => {
            if (typeof newVal == "string") {
              router.push(`/search?query=${newVal}`);
            } else {
              router.push(
                `/courses/${newVal?.content?.metadata.course.id}/media/${newVal?.content?.id}?recordId=${newVal?.mediaRecordSegment.mediaRecord?.id}`
              );
            }
          }}
          filterOptions={(x) => x}
          groupBy={(x) =>
            `${x?.content?.metadata.course.title} › ${x?.content?.metadata.name}`
          }
          renderOption={(props, option) => (
            <li {...props} key={option?.content!.id}>
              <div>
                {option?.mediaRecordSegment.mediaRecord?.name}
                <div className="text-xs text-slate-500">
                  {option.mediaRecordSegment.__typename ===
                  "DocumentRecordSegment"
                    ? `Page ${option.mediaRecordSegment.page}`
                    : `Page ${option.mediaRecordSegment.startTime}`}
                </div>
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

  const tutor = useIsTutor(_isTutor);

  return (
    <div className="sticky bottom-0 py-6 -mt-6 bg-gradient-to-t from-slate-200 from-75% to-transparent">
      <NavbarSection>
        <ListItem
          secondaryAction={
            <Tooltip title="Logout" placement="left">
              <IconButton
                edge="end"
                aria-label="logout"
                onClick={() =>
                  auth.signoutRedirect({
                    post_logout_redirect_uri:
                      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ??
                      "http://localhost:3005",
                  })
                }
              >
                <Logout />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemAvatar>
            <Avatar src={auth.user?.profile?.picture} />
          </ListItemAvatar>
          <ListItemText primary={auth.user?.profile?.name} />
        </ListItem>

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
