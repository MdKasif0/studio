// src/components/chatbot/ChatbotInterface.tsx
"use client";

import type { NutritionChatbotInput, NutritionChatbotOutput } from "@/ai/flows/nutrition-chatbot-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { handleChatbotInteraction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CornerDownLeft, Loader2, User, Bot, PlusCircle, Trash2, History, X, Pin, PinOff, Settings, Send, Mic, Volume2, FileDown, Edit3 } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getAuthUser,
  saveChatSession,
  getAllChatSessions,
  getChatSession,
  deleteChatSession,
  deleteAllChatSessions,
  setActiveChatId,
  getActiveChatId,
  saveChatDraft,
  getChatDraft,
  removeChatDraft,
  getPinnedChatIds,
  togglePinnedChat,
  saveAIPersona,
  getAIPersona,
  saveChatFeedback,
  exportChatHistory as exportHistoryUtil,
  type ChatMessage,
  type ChatSession,
  type AuthUser,
  type StoredUserDetails,
  type AIPersona,
  type ChatFeedback,
  getUserDetails,
  getApiKey,
} from "@/lib/authLocalStorage";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import { Label } from "../ui/label";

const INITIAL_AI_MESSAGE = "Hello! I'm Nutri AI. How can I help you with your nutrition today?";
const AI_PERSONAS: AIPersona[] = ["Friendly Coach", "Professional Nutritionist", "Playful Chef"];

export function ChatbotInterface() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userDetails, setUserDetails] = useState<StoredUserDetails | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);
  const [currentPersona, setCurrentPersona] = useState<AIPersona>("Friendly Coach");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'misunderstanding'>('suggestion');
  const [feedbackText, setFeedbackText] = useState("");


  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


  const loadInitialData = useCallback(() => {
    const user = getAuthUser();
    setAuthUser(user);
    if (user) {
      setUserDetails(getUserDetails(user.id));
      setChatSessions(getAllChatSessions(user.id));
      setPinnedChatIds(getPinnedChatIds(user.id));
      setCurrentPersona(getAIPersona(user.id) || "Friendly Coach");
      
      let lastActiveId = getActiveChatId(user.id);
      if (lastActiveId) {
        const session = getChatSession(user.id, lastActiveId);
        if (session) {
          setActiveChatSessionId(lastActiveId);
          setMessages(session.messages);
          setInputValue(getChatDraft(user.id, lastActiveId) || "");
        } else {
          lastActiveId = null; // Session not found, treat as new
        }
      }
      
      if (!lastActiveId) {
        startNewChat(false); // Start a new chat if no active one or previous active not found
      }
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Speech Recognition Setup
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + transcript);
        setIsListening(false);
      };
      speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let description = "An unknown error occurred with voice input.";
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          description = "Microphone access was denied. Please enable microphone permissions in your browser settings for this site.";
        } else if (event.error === 'no-speech') {
          description = "No speech was detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          description = "Audio capture failed. Ensure your microphone is working.";
        } else if (event.error) {
          description = `Error: ${event.error}.`;
        }
        toast({ variant: "destructive", title: "Voice Input Error", description: description });
        setIsListening(false);
      };
      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    // Speech Synthesis Setup
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechUtteranceRef.current = new SpeechSynthesisUtterance();
        speechUtteranceRef.current.onend = () => setIsSpeaking(false);
        speechUtteranceRef.current.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            setIsSpeaking(false);
            toast({variant: "destructive", title: "Speech Error", description: "Could not play audio."})
        };
    }


  }, [loadInitialData, toast]);

  const mutation = useMutation<NutritionChatbotOutput, Error, NutritionChatbotInput>({
    mutationFn: handleChatbotInteraction,
    onSuccess: (data, variables) => {
      if (!activeChatSessionId || !authUser) return;
      const newAiMessage: ChatMessage = { 
        id: `${Date.now()}-ai`, 
        role: "model", 
        content: data.reply, 
        suggestions: data.suggestions,
        timestamp: new Date().toISOString()
      };
      
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newAiMessage];
        const currentSession = getChatSession(authUser.id, activeChatSessionId);
        if (currentSession) {
          const updatedSession = { ...currentSession, messages: updatedMessages, updatedAt: new Date().toISOString() };
          saveChatSession(authUser.id, updatedSession);
          setChatSessions(getAllChatSessions(authUser.id)); // Refresh history list
        }
        return updatedMessages;
      });
    },
    onError: (error) => {
      if (!activeChatSessionId || !authUser) return;
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: error.message || "Could not get a response from the assistant.",
      });
      const errorAiMessage: ChatMessage = {
         id: `${Date.now()}-error`, 
         role: "system", 
         content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
         timestamp: new Date().toISOString()
      };
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, errorAiMessage];
         const currentSession = getChatSession(authUser.id, activeChatSessionId);
        if (currentSession) {
          const updatedSession = { ...currentSession, messages: updatedMessages, updatedAt: new Date().toISOString() };
          saveChatSession(authUser.id, updatedSession);
          setChatSessions(getAllChatSessions(authUser.id));
        }
        return updatedMessages;
      });
    },
  });

  const startNewChat = (userInitiated = true) => {
    if (!authUser) {
      if (userInitiated) toast({ variant: "destructive", title: "Not Logged In", description: "Please log in." });
      return;
    }
    const newChatId = `chat-${Date.now()}`;
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: newChatId,
      title: `Chat from ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: [{id: `${Date.now()}-init`, role: "system", content: INITIAL_AI_MESSAGE, timestamp: now }],
      createdAt: now,
      updatedAt: now,
      persona: currentPersona
    };
    saveChatSession(authUser.id, newSession);
    setActiveChatSessionId(newChatId);
    setMessages(newSession.messages);
    setInputValue("");
    removeChatDraft(authUser.id, newChatId); // Clear draft for new chat
    setChatSessions(getAllChatSessions(authUser.id)); // Refresh history list
    setActiveChatId(authUser.id, newChatId); // Persist active chat ID
    if (userInitiated) toast({ title: "New Chat Started" });
  };

  const loadChatSession = (sessionId: string) => {
    if (!authUser) return;
    const session = getChatSession(authUser.id, sessionId);
    if (session) {
      setActiveChatSessionId(sessionId);
      setMessages(session.messages);
      setInputValue(getChatDraft(authUser.id, sessionId) || "");
      setActiveChatId(authUser.id, sessionId);
      setIsHistoryPanelOpen(false); // Close panel after loading
    } else {
      toast({ variant: "destructive", title: "Error", description: "Chat session not found." });
      startNewChat(false); // Fallback to new chat if session is missing
    }
  };

  const handleDeleteChat = (sessionId: string) => {
    if (!authUser) return;
    deleteChatSession(authUser.id, sessionId);
    setChatSessions(getAllChatSessions(authUser.id));
    if (activeChatSessionId === sessionId) {
      startNewChat(false); // Start a new chat if the active one was deleted
    }
    toast({ title: "Chat Deleted" });
  };

  const handleClearAllChats = () => {
    if (!authUser) return;
    deleteAllChatSessions(authUser.id);
    setChatSessions([]);
    startNewChat(false);
    toast({ title: "All Chats Cleared" });
  };

  const handleTogglePin = (sessionId: string) => {
    if (!authUser) return;
    togglePinnedChat(authUser.id, sessionId);
    setPinnedChatIds(getPinnedChatIds(authUser.id));
  };
  
  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, suggestion?: string) => {
    e?.preventDefault();
    if (!authUser || !activeChatSessionId) {
      toast({ variant: "destructive", title: "Error", description: "No active chat or user not logged in." });
      return;
    }
    const currentMessageContent = suggestion || inputValue.trim();
    if (!currentMessageContent) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: currentMessageContent, timestamp: new Date().toISOString() };
    
    const updatedMessagesWithUser = [...messages, newUserMessage];
    setMessages(updatedMessagesWithUser);
    
    const currentSession = getChatSession(authUser.id, activeChatSessionId);
    if (currentSession) {
      const updatedSession = { ...currentSession, messages: updatedMessagesWithUser, updatedAt: new Date().toISOString() };
      saveChatSession(authUser.id, updatedSession);
      setChatSessions(getAllChatSessions(authUser.id));
    }
    
    const chatHistoryForApi = updatedMessagesWithUser.map(m => ({role: m.role, content: m.content}));

    const userProfileForApi = {
        healthGoals: userDetails?.primaryHealthGoal || "General wellness",
        restrictions: userDetails?.dietaryRestrictions?.other || Object.entries(userDetails?.dietaryRestrictions || {})
            .filter(([, value]) => value === true)
            .map(([key]) => key)
            .join(', ') || "None",
        preferences: undefined, 
    };
    
    const userApiKey = getApiKey(authUser.id);

    mutation.mutate({ 
      userId: authUser.id,
      message: currentMessageContent, 
      history: chatHistoryForApi.slice(-10), // Send last 10 messages for context
      userProfile: userProfileForApi,
      ...(userApiKey && { apiKey: userApiKey }),
      ...(currentPersona && {persona: currentPersona}),
      // Consider adding currentPersona to input if AI flow supports it
    });
    setInputValue("");
    removeChatDraft(authUser.id, activeChatSessionId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(undefined, suggestion);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (activeChatSessionId && authUser) {
      saveChatDraft(authUser.id, activeChatSessionId, e.target.value);
    }
  };

  const handleChangePersona = (persona: AIPersona) => {
    setCurrentPersona(persona);
    if (authUser) saveAIPersona(authUser.id, persona);
    toast({title: "AI Persona Updated", description: `Switched to ${persona}. Start a new chat for the change to fully apply.`})
  };

  const handleToggleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
      toast({variant: "destructive", title: "Voice Input Not Supported", description: "Your browser doesn't support voice input."});
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        // This catch might be redundant if onerror handles it, but good for immediate start errors
        console.error("Error starting speech recognition:", error);
        let description = "Could not start voice input. Please ensure microphone access is allowed.";
        if (error instanceof Error && (error.name === 'NotAllowedError' || error.message.includes('not-allowed'))) {
             description = "Microphone access was denied. Please enable microphone permissions in your browser settings for this site.";
        }
        toast({ variant: "destructive", title: "Voice Input Error", description });
        setIsListening(false);
      }
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (!speechUtteranceRef.current || !('speechSynthesis' in window)) {
         toast({variant: "destructive", title: "Voice Output Not Supported", description: "Your browser doesn't support voice output."});
        return;
    }
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else {
        speechUtteranceRef.current.text = text;
        window.speechSynthesis.speak(speechUtteranceRef.current);
        setIsSpeaking(true);
    }
  };
  
  const handleExportHistory = () => {
    if (!authUser) return;
    try {
        const jsonString = exportHistoryUtil(authUser.id);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutriai_chat_history_${authUser.username}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({title: "History Exported", description: "Your chat history has been downloaded."})
    } catch (error) {
        console.error("Export error:", error);
        toast({variant: "destructive", title: "Export Failed", description: "Could not export chat history."})
    }
  };

  const submitFeedback = () => {
    if (!authUser || !activeChatSessionId || !feedbackText.trim()) {
      toast({variant: "destructive", title: "Feedback Incomplete", description: "Please provide details for your feedback."});
      return;
    }
    const feedbackEntry: ChatFeedback = {
      chatSessionId: activeChatSessionId,
      type: feedbackType,
      text: feedbackText,
      timestamp: new Date().toISOString(),
    };
    saveChatFeedback(authUser.id, feedbackEntry);
    toast({title: "Feedback Sent!", description: "Thank you for your feedback."});
    setFeedbackDialogOpen(false);
    setFeedbackText("");
  };


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const displayedChatSessions = [
    ...chatSessions.filter(s => pinnedChatIds.includes(s.id)),
    ...chatSessions.filter(s => !pinnedChatIds.includes(s.id))
  ];

  return (
    <div className="flex h-full">
      {/* History Panel */}
      <div className={cn(
        "flex-col border-r bg-muted/40 transition-all duration-300 ease-in-out",
        isHistoryPanelOpen ? "w-64 p-4 space-y-2 flex" : "w-0 p-0 hidden"
      )}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Chat History</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsHistoryPanelOpen(false)} aria-label="Close history panel">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => startNewChat()}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <ScrollArea className="flex-grow">
          {displayedChatSessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No chats yet.</p>}
          {displayedChatSessions.map(session => (
            <div key={session.id} className="mb-1 group">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-1.5 px-2 text-sm",
                  activeChatSessionId === session.id && "bg-primary/10 text-primary"
                )}
                onClick={() => loadChatSession(session.id)}
              >
                <div className="flex-grow truncate">
                  <p className="font-medium truncate">{session.title || "Chat"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(session.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => {e.stopPropagation(); handleTogglePin(session.id);}}>
                  {pinnedChatIds.includes(session.id) ? <PinOff className="h-3.5 w-3.5 text-accent" /> : <Pin className="h-3.5 w-3.5" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()} >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Chat?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this chat? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteChat(session.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Button>
            </div>
          ))}
        </ScrollArea>
        <Button variant="outline" size="sm" className="w-full mt-auto" onClick={handleExportHistory}>
          <FileDown className="mr-2 h-4 w-4"/> Export All
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Clear All Chats?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete all chat history? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearAllChats} className="bg-destructive hover:bg-destructive/90">Clear All</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Chat Interface */}
      <div className="flex flex-col flex-grow h-full bg-card border rounded-lg shadow-inner">
        <header className="p-2 border-b flex items-center justify-between bg-background rounded-t-lg">
          <Button variant="ghost" size="icon" onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)} aria-label="Toggle history panel">
            <History className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium">{activeChatSessionId ? getChatSession(authUser?.id || "", activeChatSessionId)?.title : "Nutri AI Assistant"}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chat settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>AI Persona</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={currentPersona} onValueChange={(val) => handleChangePersona(val as AIPersona)}>
                {AI_PERSONAS.map(p => (
                  <DropdownMenuRadioItem key={p} value={p}>{p}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {setFeedbackType('suggestion'); setFeedbackDialogOpen(true);}}>Suggest Feature</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setFeedbackType('misunderstanding'); setFeedbackDialogOpen(true);}}>Report Misunderstanding</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end space-x-2 max-w-[85%] sm:max-w-[75%]",
                message.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start",
                index > 0 && (message.role !== "system" || message.content.includes("error")) && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out"
              )}
            >
              {message.role === "model" && (
                <Avatar className="h-7 w-7 self-start shrink-0"><AvatarFallback className="bg-primary text-primary-foreground text-xs"><Bot size={16} /></AvatarFallback></Avatar>
              )}
               {message.role === "system" && (
                <Avatar className="h-7 w-7 self-start shrink-0"><AvatarFallback className="bg-muted text-muted-foreground text-xs"><Settings size={16} /></AvatarFallback></Avatar>
              )}
              <div
                className={cn("p-2.5 rounded-lg shadow-sm text-sm",
                  message.role === "user" ? "bg-primary text-primary-foreground" :
                  message.role === "model" ? "bg-muted text-muted-foreground" :
                  "bg-amber-50 border border-amber-200 text-amber-700" // System message style (e.g. for errors)
                )}
              >
                <ReactMarkdown
                    components={{
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1 space-y-0.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1 space-y-0.5" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                    }}
                >{message.content}</ReactMarkdown>

                {message.role === "model" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1 px-2 text-left justify-start hover:bg-background/20"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={mutation.isPending}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                 <div className="text-xs mt-1.5 flex items-center gap-2" 
                    style={{ color: message.role === 'user' ? 'hsl(var(--primary-foreground) / 0.7)' : 'hsl(var(--muted-foreground) / 0.7)'}}>
                    {formatDistanceToNow(parseISO(message.timestamp), { addSuffix: true })}
                    {message.role === "model" && !message.content.toLowerCase().includes("error") && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => handleSpeakMessage(message.content)} aria-label="Speak message" disabled={isSpeaking}>
                            <Volume2 className={cn("h-3.5 w-3.5", isSpeaking && "text-accent animate-pulse")} />
                        </Button>
                    )}
                </div>
              </div>
               {message.role === "user" && (
                <Avatar className="h-7 w-7 self-start shrink-0"><AvatarFallback className="bg-accent text-accent-foreground text-xs"><User size={16} /></AvatarFallback></Avatar>
              )}
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex items-end space-x-2 justify-start animate-in fade-in duration-500">
               <Avatar className="h-7 w-7 self-start shrink-0"><AvatarFallback className="bg-primary text-primary-foreground text-xs"><Bot size={16} /></AvatarFallback></Avatar>
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">NutriAI is thinking...</span>
              </div>
            </div>
          )}
        </ScrollArea>
        <form
          onSubmit={handleSubmit}
          className="p-2.5 border-t bg-background rounded-b-lg flex items-center space-x-2"
        >
          <Button variant="ghost" size="icon" onClick={handleToggleVoiceInput} type="button" disabled={!speechRecognitionRef.current || mutation.isPending} aria-label={isListening ? "Stop listening" : "Start voice input"}>
            <Mic className={cn("h-5 w-5", isListening && "text-red-500 animate-pulse")} />
          </Button>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask me anything about nutrition..."
            className="flex-grow h-10 text-sm"
            disabled={mutation.isPending || !authUser}
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" disabled={mutation.isPending || !inputValue.trim() || !authUser} className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 w-10">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Help us improve NutriAI! What {feedbackType === 'suggestion' ? 'feature would you like to suggest' : 'went wrong or was misunderstood'}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback-text" className="sr-only">Feedback Details</Label>
            <Textarea 
              id="feedback-text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback here..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitFeedback} disabled={!feedbackText.trim()}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
