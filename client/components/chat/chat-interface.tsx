"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Heart, Bot, User, Mic, Sparkles } from "lucide-react";
import { ScrollArea } from "components/ui/scroll-area";
import { cn } from "lib/utils";
import { Avatar, AvatarFallback } from "components/ui/avatar";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { Textarea } from "components/ui/textarea";

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
}

export function ChatInterface({
  messages = [],
  onSendMessage,
  isLoading = false,
  userName = "You",
  isFetchingConversation = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR: any =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setSupportsSpeech(!!SR);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
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
      <div className="border-b p-4 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold tracking-tight">
                SantéAI
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Your personal health assistant
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full hidden sm:inline-flex"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              New insight
            </Button>
          </div>
        </div>
      </div>

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
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to SantéAI</h3>
              <p className="text-muted-foreground max-w-md">
                I'm here to help you with your health concerns. Please describe
                any symptoms, ask questions about your health, or share
                information about your lifestyle.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Remember:</strong> This conversation is for
                  informational purposes only. Always consult a healthcare
                  professional for medical advice.
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

                <div className="flex flex-col max-w-[78%] md:max-w-[70%]">
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
              <div className="flex flex-col max-w-[78%] md:max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    SantéAI
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    typing...
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

      <div className="border-t p-3 md:p-4 bg-background/60 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms, ask health questions, or share your concerns..."
            className="min-h-[52px] md:min-h-[60px] max-h-[140px] resize-none rounded-2xl border-border/60 shadow-sm"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
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
                  Listening…
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
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <span className="px-1">Stop</span>
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
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
