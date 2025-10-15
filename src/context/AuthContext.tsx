"use client";

import { User, UserRole } from "@/lib/types";
import { createContext } from "react";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string,role: UserRole) => Promise<User | null>;
  signup: (name: string, email: string, password: string, role: UserRole, details: { teacherId?: string; registerNumber?: string }) => Promise<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
