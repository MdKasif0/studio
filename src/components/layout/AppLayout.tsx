
"use client";

import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { TopAppBar } from "./TopAppBar";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Fallback for SSR to avoid hydration mismatch and layout shifts.
    // Render a simple skeleton or a non-responsive version of the layout.
    return (
      <div className="flex flex-col min-h-screen">
        <header className="h-14 border-b flex items-center px-6">
          <Leaf className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-xl font-semibold text-foreground">NutriCoach AI</h1>
        </header>
        <div className="flex flex-1">
          <aside className="w-64 border-r p-4 hidden md:block">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </aside>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        <TopAppBar />
        <main className="flex-1 overflow-y-auto p-4 pb-20"> {/* Increased pb for bottom nav + safe area */}
          {children}
        </main>
        <BottomNavigationBar />
      </div>
    );
  }

  // Desktop Layout
  return (
    <SidebarProvider defaultOpen> {/* Desktop sidebar open by default */}
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-2">
          <Link href="/" className="flex items-center gap-2 p-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">NutriCoach AI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 text-xs text-muted-foreground border-t border-sidebar-border">
          &copy; {new Date().getFullYear()} NutriCoach AI
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-md">
          {/* Desktop header content can go here, e.g., UserMenu, Search */}
          <div>{/* Placeholder for future content like breadcrumbs or page title */}</div>
          <div>{/* Placeholder for User Profile / Settings */}</div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
