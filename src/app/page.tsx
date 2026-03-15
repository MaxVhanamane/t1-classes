import { redirect } from "next/navigation";
import { getAuth } from "@/src/lib/auth/get-auth";

export default async function HomePage() {
  const auth = await getAuth();

  if (!auth) {
    return redirect("/login");
  }

  switch (auth.role) {
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
