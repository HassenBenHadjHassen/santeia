"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Heart,
  Bot,
  User,
  Mic,
  Sparkles,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "components/ui/scroll-area";
import { cn } from "lib/utils";
import { Avatar, AvatarFallback } from "components/ui/avatar";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { Textarea } from "components/ui/textarea";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  userName?: string;
  isFetchingConversation?: boolean;
  onScrollToBottom?: () => void;
}

interface PromptSuggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: "diagnosis" | "analysis" | "symptoms" | "lifestyle";
}

export function ChatInterface({
  messages = [],
  onSendMessage,
  isLoading = false,
  userName = "You",
  isFetchingConversation = false,
  onScrollToBottom,
}: ChatInterfaceProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Prompt suggestions for health-related queries
  const promptSuggestions: PromptSuggestion[] = [
    {
      id: "diagnose-bp",
      text: t("chat.promptSuggestions.diagnoseBp"),
      icon: <Activity className="h-4 w-4" />,
      category: "diagnosis",
    },
    {
      id: "diagnose-bs",
      text: t("chat.promptSuggestions.diagnoseBs"),
      icon: <TrendingUp className="h-4 w-4" />,
      category: "diagnosis",
    },
    {
      id: "overall-health",
      text: t("chat.promptSuggestions.overallHealth"),
      icon: <Heart className="h-4 w-4" />,
      category: "analysis",
    },
    {
      id: "weight-trends",
      text: t("chat.promptSuggestions.weightTrends"),
      icon: <TrendingUp className="h-4 w-4" />,
      category: "analysis",
    },
    {
      id: "symptoms-fatigue",
      text: t("chat.promptSuggestions.symptomsFatigue"),
      icon: <AlertCircle className="h-4 w-4" />,
      category: "symptoms",
    },
    {
      id: "symptoms-headache",
      text: t("chat.promptSuggestions.symptomsHeadache"),
      icon: <AlertCircle className="h-4 w-4" />,
      category: "symptoms",
    },
    {
      id: "diet-advice",
      text: t("chat.promptSuggestions.dietAdvice"),
      icon: <Sparkles className="h-4 w-4" />,
      category: "lifestyle",
    },
    {
      id: "exercise-plan",
      text: t("chat.promptSuggestions.exercisePlan"),
      icon: <Activity className="h-4 w-4" />,
      category: "lifestyle",
    },
  ];

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    // Find the actual scrollable viewport element
    const findScrollableViewport = () => {
      if (!scrollAreaRef.current) return null;

      // Try to find the Radix ScrollArea viewport
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) return viewport;

      // Fallback to the scroll area ref itself
      return scrollAreaRef.current;
    };

    const scrollToBottomElement = () => {
      const el = findScrollableViewport();
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    };

    // Use multiple approaches to ensure scrolling works
    requestAnimationFrame(scrollToBottomElement);
    setTimeout(scrollToBottomElement, 10);
    setTimeout(scrollToBottomElement, 50);
    setTimeout(scrollToBottomElement, 100);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  // Expose scroll function to parent
  useEffect(() => {
    if (onScrollToBottom) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  // Initialize component on mount
  useEffect(() => {
    // Detect Web Speech API support
    if (typeof window !== "undefined") {
      const SR: any =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setSupportsSpeech(!!SR);
    }

    // Multiple attempts to ensure scrolling works after component mount
    const timer1 = setTimeout(() => scrollToBottom(), 50);
    const timer2 = setTimeout(() => scrollToBottom(), 150);
    const timer3 = setTimeout(() => scrollToBottom(), 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    if (onSendMessage) {
      onSendMessage(suggestion.text);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = () => {
    if (isRecording) return;
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true; // Keep listening
    recognition.maxAlternatives = 1;
    // Increase timeout for silence
    if (recognition.serviceURI) {
      recognition.serviceURI =
        recognition.serviceURI + "?maxAlternatives=1&interimResults=true";
    }

    let finalTranscript = "";
    let currentInput = input; // Capture current input at start

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Only show interim results, final will be handled on end
      if (interimTranscript) {
        const baseText = currentInput.trim() ? currentInput + " " : "";
        setInput(baseText + finalTranscript + " " + interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.log("Speech recognition error:", event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      // Only stop if we're still supposed to be recording
      if (isRecording) {
        // Set final result when recognition ends
        if (finalTranscript) {
          const baseText = currentInput.trim() ? currentInput + " " : "";
          setInput(baseText + finalTranscript);
        }
        // Restart recognition to keep listening
        try {
          recognition.start();
        } catch (e) {
          // If restart fails, stop recording
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 md:p-4">
        <div className="space-y-4 md:space-y-5">
          {isFetchingConversation && (
            <div className="space-y-3">
              <div className="h-4 w-28 bg-accent rounded animate-pulse" />
              <div className="flex items-end gap-3">
                <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
                <div className="h-16 w-1/2 max-w-sm bg-accent rounded-2xl animate-pulse" />
              </div>
              <div className="flex items-end gap-3 justify-end">
                <div className="h-16 w-1/2 max-w-sm bg-primary/20 rounded-2xl animate-pulse" />
                <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <Heart className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("chat.welcomeTitle")}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {t("chat.welcomeMessage")}
                </p>
              </div>

              {showSuggestions && (
                <div className="w-full max-w-2xl">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("chat.quickSuggestions")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {promptSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-3 text-left hover:bg-accent/50 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-shrink-0 text-muted-foreground">
                            {suggestion.icon}
                          </div>
                          <span className="text-sm text-wrap leading-relaxed">
                            {suggestion.text}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-lg max-w-md">
                <p className="text-sm text-muted-foreground">
                  {t("chat.disclaimer")}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-8 w-8 shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground">
                      SantéAI
                    </span>
                  </div>
                )}

                <div className="flex flex-col max-w-[85%] sm:max-w-[78%] md:max-w-[70%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {message.role === "user" ? userName : "SantéAI"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {message.timestamp instanceof Date &&
                      !isNaN(message.timestamp.getTime())
                        ? message.timestamp.toLocaleTimeString()
                        : "Just now"}
                    </span>
                  </div>
                  <Card
                    className={cn(
                      "border border-border/60 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-accent rounded-2xl rounded-bl-sm"
                    )}
                  >
                    <CardContent className="p-3 md:p-3.5">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {message.role === "user" && (
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-8 w-8 shadow-sm">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground">
                      {userName}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center gap-1">
                <Avatar className="h-8 w-8 shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground">
                  SantéAI
                </span>
              </div>
              <div className="flex flex-col max-w-[85%] sm:max-w-[78%] md:max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    SantéAI
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t("chat.typing")}
                  </span>
                </div>
                <Card className="bg-accent rounded-2xl rounded-bl-sm border border-border/60 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/80 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/80 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/80 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background/60 backdrop-blur">
        {/* Floating suggestions when typing */}
        {showSuggestions && messages.length > 0 && input.length === 0 && (
          <div className="p-2 border-b border-border/30">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-2 py-1">
                {t("chat.quickQuestions")}
              </span>
              {promptSuggestions.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs hover:bg-accent/50"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion.icon}
                  <span className="ml-1 truncate max-w-[120px]">
                    {suggestion.text.length > 25
                      ? suggestion.text.substring(0, 25) + "..."
                      : suggestion.text}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 md:p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.length > 0 && showSuggestions) {
                    setShowSuggestions(false);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.placeholder")}
                className="w-full min-h-[52px] md:min-h-[60px] max-h-[140px] resize-none rounded-2xl border-border/60 shadow-sm"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {supportsSpeech && isRecording && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-accent border border-border/60">
                  <div className="relative h-6 w-6">
                    <span className="absolute inset-0 rounded-full bg-primary/25 animate-ping"></span>
                    <span
                      className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span className="relative block h-6 w-6 rounded-full bg-primary"></span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t("chat.listening")}
                  </span>
                </div>
              )}
              {supportsSpeech && (
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "ghost"}
                  size={isRecording ? "default" : "icon"}
                  className="rounded-full"
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={
                    isRecording
                      ? t("chat.stopRecording")
                      : t("chat.startRecording")
                  }
                >
                  {isRecording ? (
                    <span className="px-1">{t("chat.stop")}</span>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {t("chat.sendInstructions")}
          </p>
        </div>
      </div>
    </div>
  );
}
