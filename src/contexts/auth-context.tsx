"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    console.log("🔵 CLIENT: Auth initialization started");
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      console.log(
        "🔵 CLIENT: Found stored token:",
        storedToken.substring(0, 20) + "..."
      );
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      console.log("🔵 CLIENT: No stored token found");
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    console.log("🔵 CLIENT: Fetching user profile...");
    try {
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("✅ CLIENT: User profile fetched:", response.data);
      setUser(response.data);
    } catch (error: any) {
      console.error("❌ CLIENT: Failed to fetch user:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("=".repeat(50));
    console.log("🔵 CLIENT: Login attempt started");
    console.log("Email:", email);
    console.log("=".repeat(50));

    try {
      console.log("🔵 CLIENT: Sending POST request to /api/auth/login...");
      const response = await axios.post("/api/auth/login", { email, password });

      console.log("✅ CLIENT: Login response received");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      const { token: newToken, user: newUser } = response.data;

      console.log("🔵 CLIENT: Storing token in localStorage...");
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);

      console.log("✅ CLIENT: Login successful!");
      console.log("User ID:", newUser.id);
      console.log("User Name:", newUser.name);
      console.log("=".repeat(50));
    } catch (error: any) {
      console.error("=".repeat(50));
      console.error("❌ CLIENT: Login error occurred");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      console.error("=".repeat(50));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("=".repeat(50));
    console.log("🔵 CLIENT: Registration attempt started");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password length:", password.length);
    console.log("=".repeat(50));

    try {
      console.log("🔵 CLIENT: Sending POST request to /api/auth/register...");
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      console.log("✅ CLIENT: Registration response received");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      const { token: newToken, user: newUser } = response.data;

      console.log("🔵 CLIENT: Storing token in localStorage...");
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);

      console.log("✅ CLIENT: Registration successful!");
      console.log("User ID:", newUser.id);
      console.log("User Name:", newUser.name);
      console.log("=".repeat(50));
    } catch (error: any) {
      console.error("=".repeat(50));
      console.error("❌ CLIENT: Registration error occurred");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      console.error("=".repeat(50));
      throw error;
    }
  };

  const logout = () => {
    console.log("🔵 CLIENT: Logging out...");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    console.log("✅ CLIENT: Logout successful");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
