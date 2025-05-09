
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutri AI Assistant - Your Nutrition Chatbot",
  description: "Chat with Nutri AI's intelligent assistant for nutrition questions, app guidance, and daily motivation on your health journey.",
  keywords: ["ai chatbot", "nutrition assistant", "virtual coach", "health support", "Nutri AI chat"],
  openGraph: {
    title: "Chat with Your Nutri AI Assistant",
    description: "Get instant answers and support from our AI nutrition chatbot.",
    url: "https://example.com/chatbot", // Replace with your actual domain
  },
  twitter: {
    title: "Chat with Your Nutri AI Assistant",
    description: "Your personal AI nutrition guide is here to help.",
  },
};

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
