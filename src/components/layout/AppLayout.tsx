
"use client";

import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // Import usePathname
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
import { ThemeToggleButton } from "./ThemeToggleButton";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname(); // Get current pathname
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // If it's an auth page, render children directly without main app layout
  if (pathname.startsWith("/sign-in")) { // Or any other auth routes like /sign-up, /forgot-password
    return <>{children}</>;
  }


  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="h-14 border-b flex items-center px-6">
          <Leaf className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-xl font-semibold">Nutri AI</h1>
        </header>
        <div className="flex flex-1">
          <aside className="w-64 border-r p-4 hidden md:block bg-sidebar text-sidebar-foreground">
            <Skeleton className="h-8 w-3/4 mb-4 bg-muted" />
            <Skeleton className="h-6 w-full mb-2 bg-muted" />
            <Skeleton className="h-6 w-full mb-2 bg-muted" />
            <Skeleton className="h-6 w-full mb-2 bg-muted" />
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
        <main className="flex-1 overflow-y-auto p-4 pb-20">
          {children}
        </main>
        <BottomNavigationBar />
      </div>
    );
  }

  // Desktop Layout
  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-2">
          <Link href="/" className="flex items-center gap-2 p-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Nutri AI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 text-xs text-muted-foreground border-t border-sidebar-border flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Nutri AI</span>
          <ThemeToggleButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-md">
          <div></div>
          <div className="flex items-center gap-2">
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

