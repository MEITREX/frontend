// app/profile/page.tsx
import { redirect } from "next/navigation";

// TODO: Refactor this and use layout.tsx!!!
export default function ProfilePage() {
  redirect("/profile/general");
}
