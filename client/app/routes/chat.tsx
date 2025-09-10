"use client";

import { useState, useEffect, useCallback } from "react";
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

// Normalize API message roles to UI roles
function normalizeRole(role: string): "user" | "assistant" {
  const r = role?.toLowerCase();
  if (r === "user") return "user";
  // Treat anything else (assistant/system/unknown) as assistant for display
  return "assistant";
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isFetchingConversation, setIsFetchingConversation] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadConversationById = useCallback(async (conversationId: string) => {
    try {
      setIsFetchingConversation(true);
      const token = authService.getToken();
      if (!token) return;
      const conv = await conversationService.getConversationById(
        conversationId,
        token
      );
      setCurrentConversation(conv);
      const mapped: Message[] = (conv.messages || []).map((msg) => ({
        id: (msg as any).id,
        content: (msg as any).content,
        role: normalizeRole((msg as any).role as string),
        timestamp: safeParseDate(
          (msg as any).timestamp || (msg as any).createdAt
        ),
      }));
      if (mapped.length === 0) {
        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          content:
            "Hello! I'm your health assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError("Failed to load conversation.");
    } finally {
      setIsFetchingConversation(false);
    }
  }, []);

  // Fetch conversations for the user and select the most recent
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      try {
        setIsLoadingConversations(true);
        const token = authService.getToken();
        if (!token) return;
        const list = await conversationService.getAllConversations(
          { userId: user.id },
          { page: 1, limit: 50, sortBy: "updatedAt", sortOrder: "desc" },
          token
        );
        // sort client-side fallback
        list.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setConversations(list);
        if (!currentConversation && list.length > 0) {
          await loadConversationById(list[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to fetch conversations.");
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSendMessage = async (content: string) => {
    if (!user) {
      setError("No active user. Please log in again.");
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    // Lazily create a conversation if one is not active
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      try {
        const newConv = await conversationService.createConversation(
          { title: "New Chat" },
          token
        );
        setCurrentConversation(newConv);
        setConversations((prev) => [newConv, ...prev]);
        conversationId = newConv.id;
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError("Failed to start a new conversation.");
        return;
      }
    }

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

    try {
      setError(null);
      setIsLoading(true);

      let streamingMessage = "";
      let userMessage: Message | null = null;
      let aiMessageId = `temp_ai_${Date.now()}`;
      let hasStartedStreaming = false;

      await conversationService.sendMessageStream(
        conversationId,
        content,
        // onChunk - handle streaming text
        (text: string) => {
          streamingMessage += text;
          hasStartedStreaming = true;

          setMessages((prev) => {
            const newMessages = [...prev];
            // Find the streaming AI message or create one
            const streamingIndex = newMessages.findIndex(
              (msg) => msg.id === aiMessageId
            );

            if (streamingIndex >= 0) {
              // Update existing streaming message
              newMessages[streamingIndex] = {
                ...newMessages[streamingIndex],
                content: streamingMessage,
              };
            } else {
              // Add new streaming message
              const tempAiMessage: Message = {
                id: aiMessageId,
                content: streamingMessage,
                role: "assistant",
                timestamp: new Date(),
              };
              newMessages.push(tempAiMessage);
            }
            return newMessages;
          });
        },
        // onMessage - handle complete messages
        (apiMessage: any) => {
          const message: Message = {
            id: apiMessage.id,
            content: apiMessage.content,
            role: normalizeRole(apiMessage.role),
            timestamp: safeParseDate(
              apiMessage.timestamp || apiMessage.createdAt
            ),
          };

          if (message.role === "user") {
            userMessage = message;
            setMessages((prev) => {
              // Replace temp user message with real one
              const withoutTemp = prev.filter(
                (msg) => msg.id !== tempMessageId
              );
              return [...withoutTemp, message];
            });
          } else if (message.role === "assistant") {
            // Only replace if we haven't started streaming yet, or if this is the final message
            if (!hasStartedStreaming) {
              setMessages((prev) => {
                const withoutTemp = prev.filter((msg) =>
                  msg.id.startsWith("temp_ai_")
                );
                return [...withoutTemp, message];
              });
            } else {
              // Replace the streaming message with the final one
              setMessages((prev) => {
                return prev.map((msg) =>
                  msg.id === aiMessageId ? message : msg
                );
              });
            }
          }
        },
        // onError
        (error: string) => {
          console.error("Streaming error:", error);
          setError("Failed to send message. Please try again.");
          // Remove temp messages on error
          setMessages((prev) =>
            prev.filter((msg) => !msg.id.startsWith("temp_"))
          );
        },
        // onComplete
        async () => {
          setIsLoading(false);
          // Reload the conversation to get the updated data
          if (conversationId) {
            try {
              const updatedConversation =
                await conversationService.getConversationById(
                  conversationId,
                  token
                );
              setCurrentConversation(updatedConversation);
              // refresh conversations list order
              setConversations((prev) => {
                const others = prev.filter(
                  (c) => c.id !== updatedConversation.id
                );
                return [updatedConversation, ...others];
              });
            } catch (err) {
              console.error("Failed to reload conversation:", err);
            }
          }
        },
        // token
        token
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    if (currentConversation?.id === id) return;
    await loadConversationById(id);
  };

  const handleNewConversation = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const conv = await conversationService.createConversation(
        { title: "New Chat" },
        token
      );
      setConversations((prev) => [conv, ...prev]);
      await loadConversationById(conv.id);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError("Failed to start a new conversation.");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      await conversationService.deleteConversation(id, token);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
        // Optionally load the next most recent
        const next = conversations.filter((c) => c.id !== id)[0];
        if (next) {
          await loadConversationById(next.id);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      // Swallow not-found errors for idempotency UX
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="hidden lg:flex lg:w-72 lg:flex-col border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="flex flex-col flex-grow pt-4 overflow-y-auto">
            <div className="flex flex-col flex-grow px-4">
              <Sidebar
                conversations={conversations.map((c) => ({
                  id: c.id,
                  title: c.title,
                  updatedAt: c.updatedAt,
                }))}
                activeId={currentConversation?.id || null}
                onSelect={handleSelectConversation}
                onNew={handleNewConversation}
                onDelete={handleDeleteConversation}
                isLoading={isLoadingConversations}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            user={user ? { name: user.name, email: user.email } : undefined}
          />

          <div className="flex-1 overflow-hidden">
            <div className="px-4 md:px-6 lg:px-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 text-sm underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="mx-auto max-w-4xl mt-4 md:mt-6">
                <div className="mb-3 md:mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg md:text-xl font-semibold tracking-tight">
                      {currentConversation?.title || "New Chat"}
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Ask anything about your health. This is not medical
                      advice.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    userName={user?.name || "You"}
                    isFetchingConversation={isFetchingConversation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
