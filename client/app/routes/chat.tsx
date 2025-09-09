"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "../../components/chat/chat-interface";
import { Sidebar } from "../../components/layout/sidebar";
import { Header } from "../../components/layout/header";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { useAuth } from "../../lib/auth-context";
import { conversationService } from "../../lib/api";
import { authService } from "../../lib/auth";
import { safeParseDate } from "../../lib/utils";
import type { Message as ApiMessage, Conversation } from "../../lib/api/types";

// Local Message interface that matches ChatInterface expectations
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function meta() {
  return [
    { title: "Chat - SantéAI" },
    {
      name: "description",
      content: "Chat with your personal health assistant",
    },
  ];
}

// Message interface is now imported from API types

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Create a new conversation when component mounts
  useEffect(() => {
    const createInitialConversation = async () => {
      if (!user) return;

      try {
        const token = authService.getToken();
        if (!token) return;

        const conversation = await conversationService.createConversation(
          {
            title: "New Chat",
          },
          token
        );

        setCurrentConversation(conversation);

        // Add a welcome message to the UI (not stored in database)
        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          content:
            "Hello! I'm your health assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        };

        // Convert API messages to ChatInterface format and add welcome message
        const apiMessages: Message[] = (conversation.messages || []).map(
          (msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: safeParseDate(msg.timestamp),
          })
        );

        setMessages([welcomeMessage, ...apiMessages]);
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    createInitialConversation();
  }, [user]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation || !user) {
      setError("No active conversation. Please refresh the page.");
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Add user message immediately to UI
      const tempMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const tempUserMessage: Message = {
        id: tempMessageId,
        content,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

      // Send user message to the conversation
      const messageResponse = await conversationService.sendMessage(
        {
          content,
          conversationId: currentConversation.id,
        },
        token
      );

      // Replace temp message with real message and add AI response
      const formattedUserMessage: Message = {
        id: messageResponse.message.id,
        content: messageResponse.message.content,
        role: messageResponse.message.role,
        timestamp: safeParseDate(messageResponse.message.timestamp),
      };

      const formattedAiMessage: Message = {
        id: messageResponse.response.id,
        content: messageResponse.response.content,
        role: messageResponse.response.role,
        timestamp: safeParseDate(messageResponse.response.timestamp),
      };

      setMessages((prev) => {
        // Remove temp message and add real messages
        const withoutTemp = prev.filter((msg) => msg.id !== tempMessageId);
        return [...withoutTemp, formattedUserMessage, formattedAiMessage];
      });

      // Update conversation with the new messages
      const updatedConversation = await conversationService.getConversationById(
        currentConversation.id,
        token
      );
      setCurrentConversation(updatedConversation);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");

      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-4 mt-4">
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-sm underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              userName={user?.name || "You"}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
