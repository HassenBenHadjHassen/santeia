# Authentication System

This document describes the authentication system implemented in the SantéAI application.

## Overview

The authentication system uses JWT (JSON Web Tokens) for secure user authentication and authorization. It consists of both server-side and client-side components.

## Server-Side Components

### Authentication Endpoints

- `POST /api/users/login` - User login
- `POST /api/users/signup` - User registration

### Authentication Middleware

- `authenticateToken` - Validates JWT tokens for protected routes
- `requireRole` - Role-based access control

### User Service

- Password hashing using bcryptjs
- User validation and creation
- Password verification

## Client-Side Components

### AuthService (`lib/auth.ts`)

A singleton service that handles:

- API calls for login/signup
- Token management (localStorage)
- User data persistence
- Authenticated API requests

### AuthContext (`lib/auth-context.tsx`)

React context that provides:

- Global authentication state
- Login/signup/logout functions
- Loading states
- Error handling

### Components

- `ProtectedRoute` - Wrapper for protected pages
- `LogoutButton` - Logout functionality
- `UserProfile` - Display user information

## Usage

### Protecting Routes

```tsx
import { ProtectedRoute } from "components/auth/protected-route";

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### Using Authentication in Components

```tsx
import { useAuth } from "lib/auth-context";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { authService } from "lib/auth";

// The service automatically includes the JWT token
const response = await authService.authenticatedRequest(
  "/api/protected-endpoint",
  {
    method: "GET",
  }
);
```

## Environment Variables

### Server

- `JWT_SECRET` - Secret key for signing JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: "24h")

### Client

- `NODE_ENV` - Environment (development/production)
- API base URL is automatically configured based on environment

## Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT token expiration
- Rate limiting on authentication endpoints
- Secure token storage in localStorage
- Automatic token validation
- Role-based access control

## Error Handling

The system provides comprehensive error handling:

- Client-side validation
- Server-side validation
- Network error handling
- Token expiration handling
- User-friendly error messages

## Getting Started

1. Ensure the server is running with proper environment variables
2. The authentication context is automatically provided at the app level
3. Use `useAuth()` hook in any component to access authentication state
4. Wrap protected routes with `ProtectedRoute` component
