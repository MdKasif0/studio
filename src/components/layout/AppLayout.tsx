
"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { Leaf } from "lucide-react";
import Link from "next/link";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 p-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">NutriCoach AI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} NutriCoach AI
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="hidden md:block text-lg font-medium">
            {/* Could dynamically set page title here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
