"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatInterface } from "../../components/chat/chat-interface";
import { MainLayout } from "../../components/layout/main-layout";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { useAuth } from "../../lib/auth-context";
import { conversationService } from "../../lib/api";
import { authService } from "../../lib/auth";
import { safeParseDate } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import type { Message as ApiMessage, Conversation } from "../../lib/api/types";
import type { Route } from "./+types/chat";

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

export async function clientLoader() {
  // Pre-load conversations for better UX
  const token = authService.getToken();
  if (!token) {
    return { conversations: [], currentConversation: null };
  }

  try {
    const conversations = await conversationService.getAllConversations(
      { userId: "current" },
      { page: 1, limit: 50, sortBy: "updatedAt", sortOrder: "desc" },
      token
    );

    // Sort client-side as fallback
    conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      conversations,
      currentConversation: conversations.length > 0 ? conversations[0] : null,
    };
  } catch (error) {
    console.error("Failed to pre-load conversations:", error);
    return { conversations: [], currentConversation: null };
  }
}

// Mark the clientLoader to run during hydration
clientLoader.hydrate = true;

export default function Chat({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(
    loaderData?.conversations || []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isFetchingConversation, setIsFetchingConversation] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(loaderData?.currentConversation || null);
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
          content: t("chat.welcomeMessageContent"),
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError(t("chat.failedToLoadConversation"));
    } finally {
      setIsFetchingConversation(false);
    }
  }, []);

  // Fetch conversations for the user and select the most recent
  // Only run if we don't have pre-loaded data from clientLoader
  useEffect(() => {
    const fetchConversations = async () => {
      if (
        !user ||
        (loaderData?.conversations && loaderData.conversations.length > 0)
      )
        return;

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
        setError(t("chat.failedToFetchConversations"));
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loaderData]);

  const handleSendMessage = async (content: string) => {
    if (!user) {
      setError(t("chat.noActiveUser"));
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setError(t("chat.authRequired"));
      return;
    }

    // Lazily create a conversation if one is not active
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      try {
        const newConv = await conversationService.createConversation(
          { title: t("chat.newChat") },
          token
        );
        setCurrentConversation(newConv);
        setConversations((prev) => [newConv, ...prev]);
        conversationId = newConv.id;
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError(t("chat.failedToStartConversation"));
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
          setError(t("chat.failedToSendMessage"));
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
              // Hint now comes from SSE memory_saved event; no-op here
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
      setError(t("chat.failedToSendMessage"));
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
        { title: t("chat.newChat") },
        token
      );
      setConversations((prev) => [conv, ...prev]);
      await loadConversationById(conv.id);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError(t("chat.failedToStartConversation"));
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
      <MainLayout
        user={user ? { name: user.name, email: user.email } : undefined}
        conversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt,
        }))}
        activeConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoadingConversations={isLoadingConversations}
        showChatFeatures={true}
        maxWidth="full"
        padding="lg"
        centered={false}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentConversation?.title || t("chat.newChat")}
            </h1>
            <p className="text-muted-foreground">{t("chat.description2")}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-sm underline mt-1"
            >
              {t("chat.dismiss")}
            </button>
          </div>
        )}

        {/* Chat Interface Container */}
        <div className="h-[calc(100vh-16rem)]">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            userName={user?.name || "You"}
            isFetchingConversation={isFetchingConversation}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
