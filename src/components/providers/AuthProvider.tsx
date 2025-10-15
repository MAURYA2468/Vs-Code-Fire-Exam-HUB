"use client";

import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { User, UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, ReactNode } from "react";

const USERS_STORAGE_KEY = "offline-exam-pro-users";
const SESSION_STORAGE_KEY = "offline-exam-pro-session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      setIsLoading(true);
      const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const loggedInUser = users.find(u => u.id === session.userId && u.role === session.role);
        if (loggedInUser) {
          setUser(loggedInUser);
        }
      }
    } catch (error) {
      console.error("Failed to load user from session:", error);
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<User | null> => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const foundUser = users.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ userId: foundUser.id, role: foundUser.role }));
      return foundUser;
    }
    return null;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    details: { teacherId?: string; registerNumber?: string }
  ): Promise<User | null> => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    if (users.some((u) => u.email === email && u.role === role)) {
      throw new Error("An account with this email already exists for this role.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, this should be hashed.
      role,
      ...details
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ userId: newUser.id, role: newUser.role }));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    router.push("/");
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
