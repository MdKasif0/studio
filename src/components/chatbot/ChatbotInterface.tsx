"use client";

import type { NutritionChatbotInput, NutritionChatbotOutput } from "@/ai/flows/nutrition-chatbot-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleChatbotInteraction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CornerDownLeft, Loader2, User, Bot } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  suggestions?: string[];
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "initial", role: "model", content: "Hello! I'm NutriCoach AI. How can I help you with your nutrition today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation<NutritionChatbotOutput, Error, NutritionChatbotInput>({
    mutationFn: handleChatbotInteraction,
    onSuccess: (data, variables) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString() + "-ai", role: "model", content: data.reply, suggestions: data.suggestions },
      ]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: error.message || "Could not get a response from the assistant.",
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString() + "-error", role: "model", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, suggestion?: string) => {
    e?.preventDefault();
    const currentMessage = suggestion || inputValue.trim();
    if (!currentMessage) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: "user", content: currentMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    const chatHistory = messages.map(m => ({role: m.role, content: m.content}));

    // For now, userProfile is static. In a real app, this would come from user state/context.
    const userProfile = {
        healthGoals: "General wellness", // Example
    };

    mutation.mutate({ message: currentMessage, history: chatHistory, userProfile });
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end space-x-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
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
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
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
          <div className="flex items-end space-x-2 justify-start">
             <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
            <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
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
          disabled={mutation.isPending}
          aria-label="Chat message input"
        />
        <Button type="submit" size="icon" disabled={mutation.isPending || !inputValue.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
