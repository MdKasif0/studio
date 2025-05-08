
"use client";

import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react"; // Or your app icon
import { usePathname } from "next/navigation";
import { navItems } from "./navItems"; // Assuming navItems are defined centrally

export function TopAppBar() {
  const pathname = usePathname();

  const getCurrentPageTitle = () => {
    const currentNavItem = navItems.find(item => item.href === pathname);
    if (currentNavItem) return currentNavItem.label;
    if (pathname === "/") return "Dashboard";
    // Add more specific titles if needed for dynamic routes
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return "NutriCoach AI";
  };
  
  const title = getCurrentPageTitle();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Leaf className="h-7 w-7 text-primary" />
        </Link>
        <h1 className="text-lg font-medium text-foreground truncate">
          {title}
        </h1>
      </div>
      {/* Placeholder for actions like search or settings icon if needed */}
      <div>
        {/* <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button> */}
      </div>
    </header>
  );
}
