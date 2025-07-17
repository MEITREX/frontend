import { useLazyLoadQuery } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import {
  forumApiCourseNameQuery,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ForumApiCourseNameQuery } from "@/__generated__/ForumApiCourseNameQuery.graphql";

type Props = {
  courseId: string;
};

export default function CourseName({ courseId }: Props) {
  const course = useLazyLoadQuery<ForumApiCourseNameQuery>(
    forumApiCourseNameQuery,
    {
      id: courseId,
    }
  );

  return <div>{course.coursesByIds[0].title}</div>;
}
