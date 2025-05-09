
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "../globals.css"; // Adjusted path to globals.css
import { AppProviders } from "@/providers/AppProviders"; // Keep AppProviders for theme and query client

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "Sign In - Nutri AI",
  description: "Login or Sign Up for Nutri AI",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The <html> and <body> tags are managed by the root layout (src/app/layout.tsx).
  // AuthLayout should only provide the specific structure for authentication pages.
  return (
    <AppProviders>
      {/* The className for fonts and antialiasing should be on the <body> tag in the root layout.
          However, if specific styling is needed for the auth layout's wrapper, it can be applied here.
          For now, we'll rely on the root layout's body styling.
          The `geistSans.variable` is already applied in the root layout.
      */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans antialiased">
        {children}
      </main>
    </AppProviders>
  );
}
