"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Heart, Bot, User } from "lucide-react";
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
}

export function ChatInterface({
  messages = [],
  onSendMessage,
  isLoading = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 bg-secondary/30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">SantéAI</h2>
              <p className="text-sm text-muted-foreground">
                Your personal health assistant
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
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
                  "flex items-start space-x-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={cn(
                    "max-w-[80%] border-0",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl"
                      : "bg-accent rounded-2xl"
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 bg-background/60 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms, ask health questions, or share your concerns..."
            className="min-h-[60px] max-h-[120px] resize-none rounded-2xl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
