import { useParams, usePathname } from "next/navigation";

export default function OtherUserProfileForumActivity(){
  const params = useParams();
  const courseId = params.userId as string;

  //TODO fetch course activity
  return (
    <div>
      Test
    </div>
  )
}