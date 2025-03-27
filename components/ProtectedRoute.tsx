"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter(); // Use router from Next.js

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  console.log(user);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    router.push("/"); // Use Next.js router.push for redirection
    return null;
  }

  // Check for required roles if specified
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      router.push("/unauthorized");
      return null;
    }
  }

  return <>{children}</>;
}
