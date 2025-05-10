
import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareHeart } from "lucide-react";

export default function ChatbotPage() {
  return (
    // Ensure the container takes full height and allows ChatbotInterface to manage its layout
    <div className="container mx-auto flex flex-col h-full max-h-[calc(100vh-var(--mobile-header-h,56px)-var(--mobile-footer-h,0px)-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:max-h-[calc(100vh-var(--desktop-header-h,56px)-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:py-0 p-0">
        {/* 
          No outer Card needed here if ChatbotInterface handles its own bordering and background.
          ChatbotInterface will be designed to be a self-contained unit with history panel and chat area.
          The main objective is to give ChatbotInterface as much vertical space as possible.
        */}
        <ChatbotInterface />
    </div>
  );
}