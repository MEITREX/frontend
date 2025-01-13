"use client";

import { currentViewQuery } from "@/__generated__/currentViewQuery.graphql";
import React, { useEffect, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export enum PageView {
  Student = "Student",
  Lecturer = "Lecturer",
}

export const PageViewContext = React.createContext<{
  pageView: PageView;
  setPageView: (value: PageView) => void;
} | null>(null);

export function PageViewProvider({ children }: { children: React.ReactNode }) {
  const { currentUserInfo } = useLazyLoadQuery<currentViewQuery>(
    graphql`
      query currentViewQuery {
        currentUserInfo {
          id
          realmRoles
          courseMemberships {
            role
          }
        }
      }
    `,
    {}
  );

  const [pageView, setPageView] = useState<PageView | null>(null);

  useEffect(() => {
    if (!pageView) {
      const defaultRole =
        currentUserInfo.realmRoles.includes("SUPER_USER") ||
        currentUserInfo.realmRoles.includes("COURSE_CREATOR")
          ? PageView.Lecturer
          : PageView.Student;

      const currentPageView: PageView =
        (window.localStorage.getItem("current_pageview") as PageView | null) ??
        defaultRole;
      setPageView(currentPageView);
    } else {
      window.localStorage.setItem("current_pageview", pageView);
    }
  }, [currentUserInfo.realmRoles, pageView]);

  useEffect(() => {
    const isTutor =
      currentUserInfo.realmRoles.includes("SUPER_USER") ||
      currentUserInfo.realmRoles.includes("COURSE_CREATOR") ||
      currentUserInfo.courseMemberships.some(
        (x) => x.role === "TUTOR" || x.role === "ADMINISTRATOR"
      );

    if (!isTutor && pageView === PageView.Lecturer) {
      setPageView(PageView.Student);
    }
  }, [pageView, currentUserInfo]);

  return (
    <PageViewContext.Provider
      value={{ pageView: pageView ?? PageView.Student, setPageView }}
    >
      {children}
    </PageViewContext.Provider>
  );
}
