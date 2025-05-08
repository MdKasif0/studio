
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, MessageSquareHeart, BarChart3, Menu, X, ClipboardList, Replace, Award, Users, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import React from "react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { Separator } from "../ui/separator";

const mainNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/meal-plan", label: "Plan", icon: Utensils },
  { href: "/chatbot", label: "Chat", icon: MessageSquareHeart },
  { href: "/progress-tracking", label: "Track", icon: BarChart3 },
];

const moreNavItems = [
  { href: "/dietary-analysis", label: "Dietary Analysis", icon: ClipboardList },
  { href: "/recipe-alternatives", label: "Recipe Alternatives", icon: Replace },
  { href: "/challenges", label: "Challenges", icon: Award },
  { href: "/community", label: "Community", icon: Users },
  { href: "/learn", label: "Learn Nutrition", icon: BookOpen },
];

export function BottomNavigationBar() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background shadow-top">
        {mainNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center p-2 text-xs transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="mb-0.5 h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-1 flex-col items-center justify-center p-2 text-xs transition-colors",
                moreNavItems.some(nav => pathname.startsWith(nav.href)) && pathname !== "/" // Highlight if on a "more" page
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="More options"
            >
              <Menu className="mb-0.5 h-5 w-5" />
              More
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl flex flex-col p-0">
            <SheetHeader className="p-4 border-b border-border flex-row justify-between items-center">
              <SheetTitle className="text-lg">More Options</SheetTitle>
              {/* Removed explicit SheetClose here as SheetContent provides one by default */}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <ul className="space-y-1">
                {moreNavItems.map((navItem) => (
                  <li key={navItem.label}>
                    <Link
                      href={navItem.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-3 text-base transition-colors",
                        pathname === navItem.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <navItem.icon className="h-5 w-5" />
                      {navItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted">
                <div className="flex items-center gap-3 text-base text-foreground">
                  <Settings className="h-5 w-5" />
                  <span>Theme</span>
                </div>
                <ThemeToggleButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      {/* Safe area padding for content, handled by `pb-20` on main content in AppLayout */}
    </>
  );
}
