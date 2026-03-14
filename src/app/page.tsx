import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If not logged in → go to login
  if (!session) {
    redirect("/login");
  }

  // If logged in → go to dashboard
  redirect("/dashboard");
}