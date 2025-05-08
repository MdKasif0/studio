
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
  // HeartHandshake, // Removed as "Family Meal Plan" specific nav item is removed
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  {
    href: "/dietary-analysis",
    label: "Dietary Analysis",
    icon: ClipboardList,
  },
  { href: "/meal-plan", label: "Meal Plan", icon: Utensils }, // Simplified label
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
  // The "Family Meal Plan" specific link is removed from here.
  // Its functionality is expected to be part of the "/meal-plan" page.
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
