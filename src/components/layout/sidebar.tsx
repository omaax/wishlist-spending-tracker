"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  BarChart3,
  Wallet,
  History,
  GiftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const routes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wishlist", label: "Wishlist", icon: Gift },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budget", label: "Budget Planner", icon: Wallet },
  { href: "/history", label: "Purchase History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <GiftIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold">Wishlist Tracker</span>
      </div>
      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 py-2">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </nav>
        <Separator className="my-2" />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          All data stored locally
        </div>
      </ScrollArea>
    </div>
  );
}
