
"use client";

import type { NutritionChatbotInput, NutritionChatbotOutput } from "@/ai/flows/nutrition-chatbot-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleChatbotInteraction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CornerDownLeft, Loader2, User, Bot } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthUser, saveChatHistory, getChatHistory, type ChatMessage, type AuthUser, getApiKey, getUserDetails, type StoredUserDetails } from "@/lib/authLocalStorage";
import { cn } from "@/lib/utils";


export function ChatbotInterface() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userDetails, setUserDetails] = useState<StoredUserDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "initial", role: "model", content: "Hello! I'm Nutri AI. How can I help you with your nutrition today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
    if (user) {
      const storedHistory = getChatHistory(user.id);
      if (storedHistory && storedHistory.length > 0) {
        setMessages(storedHistory);
      }
      const details = getUserDetails(user.id);
      setUserDetails(details);
    }
  }, []);

  const mutation = useMutation<NutritionChatbotOutput, Error, NutritionChatbotInput>({
    mutationFn: handleChatbotInteraction,
    onSuccess: (data, variables) => {
      const newAiMessage: ChatMessage = { 
        id: Date.now().toString() + "-ai", 
        role: "model", 
        content: data.reply, 
        suggestions: data.suggestions 
      };
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newAiMessage];
        if (authUser) {
          saveChatHistory(authUser.id, updatedMessages);
        }
        return updatedMessages;
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: error.message || "Could not get a response from the assistant.",
      });
      const errorAiMessage: ChatMessage = {
         id: Date.now().toString() + "-error", 
         role: "model", 
         content: "Sorry, I encountered an error. Please try again." 
      };
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, errorAiMessage];
         if (authUser) {
          saveChatHistory(authUser.id, updatedMessages);
        }
        return updatedMessages;
      });
    },
  });

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, suggestion?: string) => {
    e?.preventDefault();
    if (!authUser) {
      toast({ variant: "destructive", title: "Not Logged In", description: "Please log in to use the chatbot." });
      return;
    }
    const currentMessageContent = suggestion || inputValue.trim();
    if (!currentMessageContent) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: currentMessageContent };
    
    const updatedMessagesWithUser = [...messages, newUserMessage];
    setMessages(updatedMessagesWithUser);
    if (authUser) {
        saveChatHistory(authUser.id, updatedMessagesWithUser);
    }
    
    const chatHistoryForApi = updatedMessagesWithUser.map(m => ({role: m.role, content: m.content}));

    const userProfileForApi = {
        healthGoals: userDetails?.primaryHealthGoal || "General wellness",
        restrictions: userDetails?.dietaryRestrictions?.other || Object.entries(userDetails?.dietaryRestrictions || {})
            .filter(([, value]) => value === true)
            .map(([key]) => key)
            .join(', ') || undefined,
        preferences: undefined, // Can be expanded if preferences are stored
    };

    const userApiKey = getApiKey(authUser.id);

    mutation.mutate({ 
      message: currentMessageContent, 
      history: chatHistoryForApi, 
      userProfile: userProfileForApi,
      ...(userApiKey && { apiKey: userApiKey }),
    });
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(undefined, suggestion);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-inner">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex items-end space-x-2",
              message.role === "user" ? "justify-end" : "justify-start",
              index > 0 && "animate-in fade-in duration-500" // Apply fade-in to new messages
            )}
          >
            {message.role === "model" && (
              <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.role === "model" && message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                  {message.suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-left justify-start w-full mt-1 hover:bg-background/10"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={mutation.isPending}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
             {message.role === "user" && (
              <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <User size={20} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex items-end space-x-2 justify-start animate-in fade-in duration-500">
             <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
            <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">NutriAI is thinking...</span>
            </div>
          </div>
        )}
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-background rounded-b-lg flex items-center space-x-2"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about nutrition..."
          className="flex-grow"
          disabled={mutation.isPending || !authUser}
          aria-label="Chat message input"
        />
        <Button type="submit" size="icon" disabled={mutation.isPending || !inputValue.trim() || !authUser} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}

