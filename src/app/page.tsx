import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/helper-functions/getCurrentUser";

export default async function HomePage() {
  let user;

  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  switch (user.role) {
    case "admin":
      redirect("/admin");

    case "student":
      redirect("/student/dashboard");

    case "teacher":
      redirect("/teacher/dashboard");

    default:
      redirect("/login");
  }
}
