
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings - Manage Your Profile",
  description: "Manage your Nutri AI profile, dietary preferences, login credentials, and app settings.",
  robots: { // Specific robots directive for this page
    index: false, // Do not index account settings
    follow: true, // Allow following links if any, though usually not needed for account page
  },
   openGraph: {
    title: "Manage Your Nutri AI Account",
    description: "Update your profile, preferences, and security settings.",
    url: "https://example.com/account", // Replace with your actual domain
  },
  twitter: {
    title: "Manage Your Nutri AI Account",
    description: "Keep your Nutri AI profile up to date.",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
