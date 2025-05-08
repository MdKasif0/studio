
import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareHeart } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="container mx-auto flex flex-col h-full max-h-[calc(100vh-var(--mobile-header-h,56px)-var(--mobile-footer-h,64px)-2rem)] md:max-h-full py-0 md:py-8">
      {/*
        Mobile height calculation:
        100vh (full viewport height)
        - 56px (TopAppBar height, assuming h-14)
        - 64px (BottomNavigationBar height, assuming h-16)
        - 2rem (padding from main content area, 1rem top + 1rem bottom from p-4)
        This ensures the card attempts to fill the available space on mobile.
        On desktop, max-h-full allows it to take content height or be constrained by parent if fixed.
      */}
      <Card className="shadow-xl flex-grow flex flex-col overflow-hidden">
        <CardHeader className="pb-4 px-4 md:px-6 pt-4 md:pt-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <MessageSquareHeart className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">NutriCoach AI Assistant</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Your personal AI guide for nutrition questions, help with using the app, and daily motivation. Ask me anything!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-2 sm:p-4">
          <ChatbotInterface />
        </CardContent>
      </Card>
    </div>
  );
}
