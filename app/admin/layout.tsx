import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/sidebar";
import { Permission, UserRole } from "@/lib/permissions";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children?: ReactNode;
  userRoles?: UserRole[] | UserRole;
  additionalPermissions?: Permission[];
}

export default function layout({
  children,
  additionalPermissions = [],
}: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={["admin", "manager","cashier"]}>
      <div className="flex min-h-screen">
        <Sidebar additionalPermissions={additionalPermissions} />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
