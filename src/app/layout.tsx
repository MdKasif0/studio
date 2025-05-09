
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { AppLayout } from "@/components/layout/AppLayout";

const geistSans = GeistSans;

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'), // Replace with your actual domain
  title: {
    default: "Nutri AI - Your Personalized Nutrition Coach",
    template: "%s | Nutri AI",
  },
  description: "Nutri AI offers AI-enabled personalized nutrition coaching, custom meal plans, dietary analysis, and recipe suggestions to help you achieve your health goals.",
  keywords: ["nutrition", "ai coach", "meal plan", "diet", "health", "fitness", "personalized nutrition", "dietary analysis", "recipes"],
  authors: [{ name: "Nutri AI Team" }],
  creator: "Nutri AI",
  publisher: "Nutri AI",
  openGraph: {
    title: "Nutri AI - Personalized Nutrition Coaching",
    description: "Transform your health with AI-driven meal plans and nutrition advice.",
    url: "https://example.com", // Replace with your actual domain
    siteName: "Nutri AI",
    images: [
      {
        url: "https://example.com/og-default.png", // Replace with your actual default OG image URL
        width: 1200,
        height: 630,
        alt: "Nutri AI Logo and Tagline",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutri AI - Personalized Nutrition Coaching",
    description: "Get your AI-powered nutrition plan today!",
    // siteId: "@YourTwitterHandle", // Replace with your Twitter handle ID
    // creator: "@YourTwitterHandle", // Replace with your Twitter handle
    // images: {
    //   url: "https://example.com/twitter-default.png", // Replace with your actual default Twitter image URL
    //   alt: "Nutri AI App Preview",
    // },
  },
  // icons: { // Consider adding favicons
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },
  // verification: { // Example for Google Search Console
  //   google: "your-google-site-verification-code",
  // },
  // alternates: { // If you have multiple languages
  //   canonical: '/',
  //   languages: {
  //     'en-US': '/en-US',
  //   },
  // },
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
