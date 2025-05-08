
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { AppLayout } from "@/components/layout/AppLayout";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "Nutri AI",
  description: "AI-Enabled Personalized Nutrition Coaching",
};

export default function RootLayout({
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
          {/* AppLayout will now conditionally render its structure based on route */}
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}

