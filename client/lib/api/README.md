# API Service Documentation

This directory contains a comprehensive API service that centralizes all API communications for the SantéAI application.

## Structure

```
client/lib/api/
├── index.ts              # Main API service and exports
├── client.ts             # Base API client with error handling and retry logic
├── types.ts              # TypeScript types and interfaces
├── services/
│   ├── userService.ts    # User-related API calls
│   ├── conversationService.ts # Conversation-related API calls
│   └── llmService.ts     # LLM-related API calls
├── examples/
│   └── chatExample.ts    # Usage examples
└── README.md             # This documentation
```

## Quick Start

```typescript
import { api } from "./lib/api";

// Login user
const authResponse = await api.users.login({
  email: "user@example.com",
  password: "password123",
});

// Create a conversation
const conversation = await api.conversations.createConversation(
  {
    title: "Health Consultation",
    initialMessage: "I have a headache",
  },
  authResponse.token
);

// Send a message
const message = await api.conversations.sendMessage(
  {
    content: "What should I do?",
    conversationId: conversation.id,
  },
  authResponse.token
);

// Get AI response
const aiResponse = await api.llm.generateConversationResponse(
  "What should I do?",
  conversation.id,
  authResponse.token
);
```

## Services

### UserService

Handles all user-related operations:

```typescript
// Authentication
await api.users.login(credentials);
await api.users.signup(credentials);

// User management
await api.users.getUserById(id, token);
await api.users.getAllUsers(filters, pagination, token);
await api.users.updateUser(id, userData, token);
await api.users.deleteUser(id, token);

// Health check
await api.users.healthCheck();
```

### ConversationService

Manages conversations and messages:

```typescript
// Conversation CRUD
await api.conversations.createConversation(data, token);
await api.conversations.getConversationById(id, token);
await api.conversations.getAllConversations(filters, pagination, token);
await api.conversations.updateConversation(id, data, token);
await api.conversations.deleteConversation(id, token);

// Message operations
await api.conversations.sendMessage(messageData, token);

// User-specific operations
await api.conversations.getUserConversations(userId, pagination, token);
await api.conversations.searchConversations(searchTerm, pagination, token);
```

### LLMService

Handles AI/LLM operations:

```typescript
// General text generation
await api.llm.generateText(request, token);

// Specialized methods
await api.llm.generateHealthAdvice(prompt, conversationId, token);
await api.llm.generateConversationResponse(message, conversationId, token);
await api.llm.generateSummary(text, token);

// Model information
await api.llm.getModelInfo(token);
```

## Error Handling

The API service includes comprehensive error handling:

```typescript
import { ApiError } from "./lib/api";

try {
  const response = await api.users.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API Error:", error.message);
    console.error("Status Code:", error.statusCode);
    console.error("Error Code:", error.code);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Configuration

The API service is configured with sensible defaults:

- **Base URL**: Automatically switches between development and production
- **Timeout**: 15 seconds
- **Retries**: 3 attempts with exponential backoff
- **Retry Delay**: 1 second base delay

You can customize these settings by modifying the configuration in `index.ts`.

## Type Safety

All API calls are fully typed with TypeScript:

```typescript
// Fully typed response
const user: User = await api.users.getUserById(id, token);

// Typed request parameters
const conversation = await api.conversations.createConversation(
  {
    title: "My Health Chat", // string
    initialMessage: "Hello", // string | undefined
  },
  token
);
```

## Authentication

The API service handles authentication tokens automatically when provided:

```typescript
// Pass token explicitly
await api.users.getUserById(id, token);

// Or use the auth service integration
import { authService } from "../auth";
const token = authService.getToken();
await api.conversations.getAllConversations({}, {}, token);
```

## Examples

See `examples/chatExample.ts` for comprehensive usage examples including:

- Creating and managing conversations
- Sending messages with AI responses
- Searching conversation history
- Getting health advice
- Error handling patterns

## Integration with Existing Code

The API service is designed to work seamlessly with the existing authentication system:

```typescript
// In your components
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";

function ChatComponent() {
  const { user } = useAuth();
  const token = authService.getToken();

  const handleSendMessage = async (content: string) => {
    try {
      const message = await api.conversations.sendMessage(
        {
          content,
          conversationId: currentConversation.id,
        },
        token
      );

      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use TypeScript**: Leverage the full type safety
3. **Pass tokens explicitly**: For better control over authentication
4. **Use pagination**: For large data sets
5. **Implement loading states**: Show users when requests are in progress
6. **Cache responses**: When appropriate to reduce API calls

## Development

To add new API endpoints:

1. Add types to `types.ts`
2. Create or update service classes in `services/`
3. Export new services from `index.ts`
4. Add usage examples to `examples/`
5. Update this documentation
