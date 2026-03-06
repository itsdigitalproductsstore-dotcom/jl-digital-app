import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, Package, BarChart3 } from "lucide-react";
import { getUserRole, getUserProfile } from "@/utils/auth";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/dashboard/client", label: "My Orders", icon: Package, roles: ["client"] },
  { href: "/dashboard/staff", label: "Staff Panel", icon: Users, roles: ["staff", "admin", "owner"] },
  { href: "/dashboard/admin", label: "Admin", icon: BarChart3, roles: ["admin", "owner"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();
  const profile = await getUserProfile();

  if (!role || !profile) {
    redirect("/login");
  }

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 border-r border-gray-800 p-6 hidden lg:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold">JL Digital</h2>
          <p className="text-sm text-gray-400">Dashboard</p>
        </div>

        <nav className="space-y-2 mb-8">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
