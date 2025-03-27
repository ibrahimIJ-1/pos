"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import login from "@/actions/auth/login";
import { userRegister } from "@/actions/auth/register";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userLogin: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const removeCredentials = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };
  useEffect(() => {
    // Check for existing session on mount

    const checkAuth = async () => {
      const token = Cookies.get("authToken");
      const savedUser = Cookies.get("user");
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          removeCredentials();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const getMacAddress = async () => {
    try {
      const response = await fetch("http://localhost:5001/getmac");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const macAddress = await response.text();
      return macAddress
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return null;
    }
  };

  const userLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const mac = await getMacAddress();
      if(!mac) throw new Error('you are not eligibal to use this software')
      const response = await login(email, password,mac);
      const { user, token } = response;

      // ✅ Store auth token in cookies instead of localStorage
      Cookies.set("authToken", token, {
        expires: 7,
        secure: false,
        sameSite: "Strict",
      });

      // ✅ Store user info in cookies (optional, or you can use context)
      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        secure: false,
        sameSite: "Strict",
      });

      // Store auth data
      // localStorage.setItem("authToken", token);
      // localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Successfully logged in");
    } catch (error) {
      // Error handling is done in the apaAAGHGHHi interceptor
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => {
    try {
      setIsLoading(true);
      const response = await userRegister(name, email, password, role);

      toast.success("Registration successful. You can now log in.");
      return response;
    } catch (error) {
      // Error handling is done in the api interceptor
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        userLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
