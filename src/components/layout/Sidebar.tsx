"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof NavIcons;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "Dashboard" },
  { href: "/forecast", label: "Forecast", icon: "Forecast" },
  { href: "/chat", label: "Chat", icon: "Chat" },
  { href: "/alerts", label: "Alerts", icon: "Alerts" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-5 pt-5">
        <h2 className="mb-4 px-4 text-lg font-semibold">RADA</h2>
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = NavIcons[item.icon];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
