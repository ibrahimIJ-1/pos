"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast, Toaster } from "sonner";
import login from "@/actions/auth/login";
import { userRegister } from "@/actions/auth/register";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUserPermissions } from "@/actions/users/get-all-permissions";
import logoutUser from "@/actions/auth/logout";
import { useTranslations } from "next-intl";

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
  permissions: Set<string>;
  userLogin: (email: string, password: string) => Promise<void>;
  macAddress: string | null;
  macLoading: boolean;
  getMacAddress: () => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const getPermissionMutation = useMutation({
    mutationFn: getAllUserPermissions,
    onSettled: (data) => {
      if (data) setPermissions(data);
    },
    onError: (error) => {
      console.error("Error fetching permissions", error);
    },
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [macAddress, setMacAddress] = useState<string | null>(null);
  const [macLoading, setMacLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const removeCredentials = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const getPermissions = () => {
    getPermissionMutation.mutate();
  };
  const getMacAddress = async () => {
    try {
      setMacLoading(true);
      const response = await fetch("http://localhost:5001/getmac");
      if (!response.ok) {
        toast.error(t("Error fetching SN"));
      }
      const macAddress = await response.text();
      setMacAddress(macAddress);
      return macAddress;
    } catch (error) {
      toast.error(t("Error fetching SN"));
      //REMOVE !!!
      setMacAddress("R9NRKD034636377");
      return "R9NRKD034636377";
    } finally {
      setMacLoading(false);
    }
  };
  useEffect(() => {
    getMacAddress();
  }, []);
  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = Cookies.get("authToken");
      const savedUser = Cookies.get("user");
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          getPermissions();
        } catch (error) {
          toast.error(t("Failed to parse user data"));
          removeCredentials();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const userLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const mac = await getMacAddress();
      if (!mac) {
        toast.error(t("You are not eligible to use this software"));
        throw new Error("You are not eligible to use this software");
      }
      const response = await login(email, password, mac);
      const { user, token } = response;

      Cookies.set("authToken", token, {
        expires: 7,
        secure: false,
        sameSite: "Strict",
      });
      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        secure: false,
        sameSite: "Strict",
      });
      setUser(user);

      toast.success(t("Successfully logged in"));
    } catch (error: any) {
      toast.error(t("Failed to log in"));
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

      toast.success(t("Registration successful. You can now log in."));
      return response;
    } catch (error) {
      // Error handling is done in the api interceptor
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const response = await logoutUser();
    if (response === true) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      Cookies.remove("authToken");
      Cookies.remove("user");
      setUser(null);

      toast.info(t("You have been logged out"));
      return ;
    }
    toast.error(t("Log out failed"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        userLogin,
        register,
        macLoading,
        logout,
        permissions,
        macAddress,
        getMacAddress,
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
