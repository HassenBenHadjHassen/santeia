"use client";

import { useState } from "react";
import { ChatInterface } from "../../components/chat/chat-interface";
import { Sidebar } from "../../components/layout/sidebar";
import { Header } from "../../components/layout/header";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { useAuth } from "../../lib/auth-context";

export function meta() {
  return [
    { title: "Chat - SantéAI" },
    {
      name: "description",
      content: "Chat with your personal health assistant",
    },
  ];
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response - in a real app, this would call your backend
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for sharing that information. I understand you're experiencing ${content.toLowerCase()}. 

Based on what you've described, I'd recommend monitoring your symptoms and considering the following:

• Keep track of when symptoms occur and their severity
• Stay hydrated and get adequate rest
• Consider any recent changes in your routine or environment

**Important:** If your symptoms worsen or persist, please consult with a healthcare professional. This conversation is for informational purposes only and should not replace professional medical advice.

Is there anything specific about your symptoms you'd like to discuss further?`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-muted/30">
            <div className="flex flex-col flex-grow px-3">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            user={user ? { name: user.name, email: user.email } : undefined}
          />
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
