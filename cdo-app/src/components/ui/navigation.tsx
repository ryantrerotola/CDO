"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Newspaper,
  User,
  TrendingUp,
  BookOpen,
  PenLine,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/content", label: "Content", icon: Newspaper },
  { href: "/linkedin", label: "LinkedIn", icon: PenLine },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)]">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--primary)]">CDO Path</h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Career Growth Engine
        </p>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-3">
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || session.user.email}
              </p>
              {session.user.name && (
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors w-full"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
