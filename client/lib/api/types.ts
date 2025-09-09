// API Types and Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

// Conversation Types
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId: string;
}

export interface SendMessageResponse {
  message: Message;
  response: Message;
}

export interface ConversationFilters {
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// LLM Types
export interface LLMGenerateRequest {
  prompt: string;
  userId: string;
  conversationId?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface LLMGenerateResponse {
  text: string;
  tokens: number;
  duration: number;
  cost?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
}

export interface RecentRequest {
  id: string;
  model: string;
  prompt: string;
  response: string;
  tokens: number;
  cost: number;
  duration: number;
  createdAt: string;
}

// Error Types
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Request Configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}
