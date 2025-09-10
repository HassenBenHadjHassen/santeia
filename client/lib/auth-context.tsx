// Authentication context for managing user state
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "./auth";
import { userService } from "./api";
import type { User, LoginCredentials, SignupCredentials } from "./api/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();

        if (isAuth && currentUser) {
          setUser(currentUser);
        } else {
          // Clear invalid auth data
          authService.clearAuth();
          setUser(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        authService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auth checks: immediate on mount, on window focus, and periodic
  useEffect(() => {
    let interval: number | undefined;

    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        if (!token) throw new Error("No token");
        const me = await userService.me(token);
        if (!me?.id) throw new Error("Invalid user");
      } catch (err: any) {
        authService.logout();
        setUser(null);
        setError(null);
      }
    };

    // Run once when user exists
    if (user) {
      checkAuth();
      // Shorter interval (30s)
      interval = window.setInterval(checkAuth, 30000);
      // On focus
      const onFocus = () => checkAuth();
      window.addEventListener("focus", onFocus);
      return () => {
        if (interval) window.clearInterval(interval);
        window.removeEventListener("focus", onFocus);
      };
    }
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signup(credentials);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
