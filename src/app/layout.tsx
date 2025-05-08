import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
// Removed GeistMono import as it was causing a module not found error and is not explicitly used.
// If mono font is needed later, ensure the path is correct or the package is installed.
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { AppLayout } from "@/components/layout/AppLayout"; // Updated import

const geistSans = GeistSans;
// const geistMono = GeistMono; // Commented out due to error

export const metadata: Metadata = {
  title: "NutriCoach AI",
  description: "AI-Enabled Personalized Nutrition Coaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} // Adjusted to remove geistMono variable
        className={`${geistSans.variable} font-sans antialiased`}
      >
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
