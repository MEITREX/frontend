"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
import { CourseCard, yearDivisionToStringShort } from "@/components/CourseCard";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { chain } from "lodash";
import Link from "next/link";
import { Fragment, Suspense, useEffect, useState } from "react";
import { useLazyLoadQuery, usePreloadedQuery, useQueryLoader } from "react-relay";
import { graphql } from "relay-runtime";
import SurveyPopup from "@/components/PlayerTypeSurvey"
import { PlayerTypeSurveyUserQuery } from "@/__generated__/PlayerTypeSurveyUserQuery.graphql";
import { PlayerTypeSurveyQuery } from "@/__generated__/PlayerTypeSurveyQuery.graphql";

export default function StudentPage() {
  const { currentUserInfo } = useLazyLoadQuery<studentStudentQuery>(
    graphql`
      query studentStudentQuery {
        currentUserInfo {
          id
          availableCourseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
              userProgress {
                progress
              }
              suggestions(amount: 3) {
                ...SuggestionFragment
              }
              ...CourseCardFragment
            }
          }
          unavailableCourseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
              ...CourseCardFragment
            }
          }
        }
      }
    `,
    {}
  );

  const courses = [
    ...currentUserInfo.availableCourseMemberships.map((m) => ({
      course: m.course,
      suggestions: m.course.suggestions,
      progress: m.course.userProgress.progress,
      available: true,
    })),
    ...currentUserInfo.unavailableCourseMemberships.map((m) => ({
      course: m.course,
      suggestions: [],
      progress: 0,
      available: false,
    })),
  ];

  const [sortby, setSortby] = useState<"yearDivision" | "title" | "startYear">(
    "yearDivision"
  );

  const courseSections = chain(courses)
    .groupBy((x) => {
      if (sortby === "startYear") {
        return x.course.startYear;
      } else if (sortby === "title") {
        return x.course.title[0];
      } else {
        return x.course.yearDivision
          ? yearDivisionToStringShort[x.course.yearDivision] +
          " " +
          dayjs(x.course.startDate).year()
          : dayjs(x.course.startDate).year();
      }
    })
    .entries()
    .orderBy(
      sortby === "yearDivision"
        ? [
          ([key, courses]) => courses[0].course.startYear,
          ([key, courses]) => courses[0].course.yearDivision,
        ]
        : ([key, _]) => key,

      sortby === "title" ? "asc" : "desc"
    )
    .map(([key, courses]) => {
      return (
        <Fragment key={key}>
          <Typography variant="h6" gutterBottom>
            {key}
          </Typography>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8 mb-10">
            {courses.map((c) => (
              <CourseCard
                key={c.course.id}
                _course={c.course}
                _suggestions={c.suggestions}
                progress={c.progress}
                available={c.available}
              />
            ))}
          </div>
        </Fragment>
      );
    })

    .value();

  var showSurvey = false
  const playerTypeSurveyQuery = graphql`
    query PlayerTypeSurveyQuery($id: UUID!) {
      getPlayerHexadScoreById(userId: $id) {
        scores {
          type
          value
        }
      }
    }
  `;

  function SurveyLoader({queryRef, userId} : { queryRef: any, userId: any }) {
    console.log('ENETRT')
    
    const data = usePreloadedQuery(playerTypeSurveyQuery, queryRef);

    console.log('DATA', data)
    console.log('test')
    if(!data){
      return <SurveyPopup id={userId} />;
    }
    return <div></div>
   
     
      
    
    
    

    
  }

  function GetPlayerHexadScore() {

    const userId = currentUserInfo.id;
    const [queryRef, loadQuery] = useQueryLoader(playerTypeSurveyQuery);

    useEffect(() => {
      const timer = setTimeout(() => {
        loadQuery({ id: userId });
      }, 1); // künstlicher Delay

      return () => clearTimeout(timer);
    }, [userId, loadQuery]);

    console.log('QUERYREF', queryRef, userId)

    return (
      <Suspense fallback={<div>Loading...</div>}>
        {queryRef && <SurveyLoader queryRef={queryRef} userId={currentUserInfo.id} />}
      </Suspense>
    );

    
    

    
  }

  return (
    <main>
      <div className="flex flex-wrap justify-between mb-10">
        <GetPlayerHexadScore></GetPlayerHexadScore>
        <Typography variant="h1" gutterBottom>
          Dashboard
        </Typography>
        {/* Sort by Selection */}
        <Box sx={{ minWidth: 120, maxWidth: 150 }}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortby}
              onChange={(e) => setSortby(e.target.value as any)}
              label={"Sort By"}
            >
              <MenuItem value={"yearDivision"}>Semester</MenuItem>
              <MenuItem value={"title"}>Alphabetically</MenuItem>
              <MenuItem value={"startYear"}>Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>

      {courseSections}

      {courses.length === 0 && (
        <div className="text-center text-2xl text-slate-400 my-80">
          You have not joined any courses yet. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      )}
    </main>
  );
}
