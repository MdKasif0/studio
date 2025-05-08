import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareHeart } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="container mx-auto flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] py-8">
      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquareHeart className="h-8 w-8 text-accent" />
            <CardTitle className="text-3xl font-bold tracking-tight">NutriCoach AI Assistant</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Your personal AI guide for nutrition questions, app help, and daily motivation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0 sm:p-4">
          <ChatbotInterface />
        </CardContent>
      </Card>
    </div>
  );
}
