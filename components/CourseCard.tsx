import { CourseCardFragment$key } from "@/__generated__/CourseCardFragment.graphql";
import { YearDivision } from "@/__generated__/lecturerCreateCourseMutation.graphql";
import { SuggestionFragment$key } from "@/__generated__/SuggestionFragment.graphql";
import { PageView, usePageView } from "@/src/currentView";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { graphql, useFragment } from "react-relay";
import { Suggestion } from "./Suggestion";
import clsx from "clsx";

export const yearDivisionToString: Record<YearDivision, string> = {
  FIRST_SEMESTER: "Winter semester",
  SECOND_SEMESTER: "Summer semester",
  FIRST_TRIMESTER: "1st Trimester",
  SECOND_TRIMESTER: "2nd Trimester",
  THIRD_TRIMESTER: "3rd Trimester",
  FIRST_QUARTER: "1st Quarter",
  SECOND_QUARTER: "2nd Quarter",
  THIRD_QUARTER: "3rd Quarter",
  FOURTH_QUARTER: "4th Quarter",

  "%future added value": "Unknown",
};

export const yearDivisionToStringShort: Record<YearDivision, string> = {
  FIRST_SEMESTER: "Winter",
  SECOND_SEMESTER: "Summer",
  FIRST_TRIMESTER: "1st Trim.",
  SECOND_TRIMESTER: "2nd Trim.",
  THIRD_TRIMESTER: "3rd Trim.",
  FIRST_QUARTER: "Q1",
  SECOND_QUARTER: "Q2",
  THIRD_QUARTER: "Q3",
  FOURTH_QUARTER: "Q4",

  "%future added value": "Unknown",
};

export function CourseCard({
  _course,
  _suggestions = [],
  progress = 0,
  available = true,
}: {
  _course: CourseCardFragment$key;
  _suggestions?: readonly SuggestionFragment$key[];
  progress?: number;
  available?: boolean;
}) {
  const [pageView, _] = usePageView();
  const course = useFragment(
    graphql`
      fragment CourseCardFragment on Course {
        id
        title
        startDate
        yearDivision
      }
    `,
    _course,
  );

  const theme = useTheme();

  return (
    <Card variant="outlined" className="h-full" key={course.id}>
      <CardContent>
        <div className="flex items-center">
          <div className="mr-4 grid aspect-square min-w-[40px]">
            <CircularProgress
              variant="determinate"
              value={100}
              sx={{
                color: (theme) => theme.palette.grey[200],
              }}
              className="col-start-1 row-start-1"
            />
            <CircularProgress
              variant="determinate"
              value={pageView === PageView.Student ? progress : 0}
              color="success"
              className="col-start-1 row-start-1"
            />
          </div>
          <Typography variant="h6" component="div" className="overflow-hidden">
            <Link
              href={available ? `/courses/${course.id}` : undefined}
              underline="none"
              color="text.primary"
            >
              {course.title}
            </Link>
          </Typography>
          <div className="min-w-0 grow"/>
          <Chip
            label={
              course.yearDivision
                ? yearDivisionToStringShort[course.yearDivision] +
                  " " +
                  dayjs(course.startDate).year()
                : dayjs(course.startDate).year()
            }
          ></Chip>
        </div>
      </CardContent>

      <Divider />
      <div className="flex flex-col m-4 gap-2 items-start grow min-h-[12rem]">
        {_suggestions.map((suggestion, i) => (
          <Suggestion
            courseId={course.id}
            key={`${course.id}-suggestion-${i}`}
            _suggestion={suggestion}
          />
        ))}
        {available && _suggestions.length === 0 && (
          <div className="w-full grow flex items-center text-center justify-center text-gray-600">
            You are all set.
            <br />
            No suggestions for this course
          </div>
        )}
        {!available && (
          <div className="w-full grow flex items-center text-center justify-center text-gray-600">
            This course has not started yet or has already ended
          </div>
        )}
      </div>
    </Card>
  );
}
