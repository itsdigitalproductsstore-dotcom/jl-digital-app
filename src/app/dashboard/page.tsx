import { redirect } from "next/navigation";
import { getUserRole, getUserProfile } from "@/utils/auth";
import { getDashboardPath } from "@/types/rbac";

export default async function DashboardHub() {
  const role = await getUserRole();
  const profile = await getUserProfile();

  if (!role || !profile) {
    redirect("/login");
  }

  const dashboardPath = getDashboardPath(role);
  redirect(dashboardPath);
}
