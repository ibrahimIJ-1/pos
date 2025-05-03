"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextTopLoader color="#10b981" showSpinner={false} />
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
        <ReactQueryDevtools />
      </AuthProvider>
    </QueryClientProvider>
  );
}
