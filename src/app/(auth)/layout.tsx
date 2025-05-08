
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} font-sans antialiased`}
      >
        <AppProviders>
          <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}

