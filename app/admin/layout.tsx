import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/sidebar/sidebar";
import { Permission, UserRole } from "@/lib/permissions";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { SystemProvider } from "@/providers/SystemProvider";
import { SidebarAdminItems } from "@/components/sidebar/sidebar-items";

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: AdminLayoutProps) {
  const additionalPermissions: any = [];

  return (
    <ProtectedRoute requiredRoles={["admin", "manager", "cashier"]}>
      <div className="flex min-h-screen dark:bg-black dark:border-b-1 dark:border-r-1 dark:border-l-1 rounded-md dark:shadow-md dark:shadow-violet-700 dark:border-violet-800">
        <main className="flex-1 overflow-y-auto">
          <div className="">
            <SystemProvider>
              <Navbar>
                <Sidebar canShowBranches additionalPermissions={[]} sidebarItems={SidebarAdminItems} />
              </Navbar>
              {children}
            </SystemProvider>
          </div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
