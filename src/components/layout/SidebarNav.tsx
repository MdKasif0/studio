"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Utensils,
  Replace,
  MessageSquareHeart,
  Award,
  Users,
  BookOpen,
  BarChart3,
  HeartHandshake, // Changed from Users2, more fitting for family
  Leaf, // Keeping Leaf for main brand
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  {
    href: "/dietary-analysis",
    label: "Dietary Analysis",
    icon: ClipboardList,
  },
  { href: "/meal-plan", label: "Meal Plan Generator", icon: Utensils },
  {
    href: "/recipe-alternatives",
    label: "Recipe Alternatives",
    icon: Replace,
  },
  {
    href: "/chatbot",
    label: "AI Assistant",
    icon: MessageSquareHeart,
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: Award,
  },
  {
    href: "/community",
    label: "Community",
    icon: Users,
  },
  {
    href: "/meal-plan", // Family plan will enhance the meal plan page for now
    label: "Family Meal Plan",
    icon: HeartHandshake,
  },
  {
    href: "/learn",
    label: "Learn Nutrition",
    icon: BookOpen,
  },
  {
    href: "/progress-tracking",
    label: "Progress Tracking",
    icon: BarChart3,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href + item.label}> {/* Ensure unique key if href can be same */}
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href && (item.href !== "/meal-plan" || (item.href === "/meal-plan" && (item.label === "Meal Plan Generator" && pathname === "/meal-plan" || item.label === "Family Meal Plan" && pathname === "/meal-plan" ) ) )}
              className={cn(
                "w-full justify-start",
                pathname === item.href && (item.href !== "/meal-plan" || (item.href === "/meal-plan" && (item.label === "Meal Plan Generator" && pathname === "/meal-plan" || item.label === "Family Meal Plan" && pathname === "/meal-plan" ))) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              )}
              tooltip={item.label}
            >
              <a>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
