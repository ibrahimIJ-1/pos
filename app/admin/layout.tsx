import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/sidebar";
import { Permission, UserRole } from "@/lib/permissions";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: AdminLayoutProps) {
  const additionalPermissions: any = [];

  return (
    <ProtectedRoute requiredRoles={["admin", "manager", "cashier"]}>
      <div className="flex min-h-screen">
        <main className="flex-1 overflow-y-auto">
          <div className="">
            <Navbar>
              <Sidebar additionalPermissions={[]} />
            </Navbar>
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
