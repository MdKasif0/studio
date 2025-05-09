
"use client";

import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname and useRouter
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
import { Leaf, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { getAuthUser, clearUserSession } from "@/lib/authLocalStorage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const authUser = getAuthUser();
    if (authUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setAuthChecked(true);
  }, [pathname]); // Re-check on pathname change if needed, though initial check is key

  useEffect(() => {
    if (authChecked && !isAuthenticated && !pathname.startsWith("/sign-in")) {
      router.replace("/sign-in");
    }
  }, [authChecked, isAuthenticated, pathname, router]);

  const handleLogout = () => {
    const authUser = getAuthUser();
    clearUserSession(authUser?.id);
    setIsAuthenticated(false);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/sign-in");
  };

  if (pathname.startsWith("/sign-in")) {
    return <>{children}</>;
  }

  if (!authChecked || (!isAuthenticated && !pathname.startsWith("/sign-in"))) {
    // Show a loading state or a minimal layout while auth is being checked or redirecting
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <Leaf className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading Nutri AI...</p>
      </div>
    );
  }
  
  if (!isClient) { // Fallback for server rendering or before client hydration
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="h-14 border-b flex items-center px-6 justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Nutri AI</h1>
          </Link>
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
        <BottomNavigationBar onLogout={handleLogout} />
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
        <SidebarFooter className="p-4 text-xs text-muted-foreground border-t border-sidebar-border flex flex-col items-start gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
          <div className="flex justify-between items-center w-full mt-2">
            <span>&copy; {new Date().getFullYear()} Nutri AI</span>
            <ThemeToggleButton />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-md">
          <div></div> {/* Placeholder for potential breadcrumbs or page title */}
          <div className="flex items-center gap-2">
            {/* User avatar/menu could go here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
