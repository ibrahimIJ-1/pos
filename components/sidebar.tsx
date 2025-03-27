"use client";

import * as React from "react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  Package,
  Coins,
  ListChecks,
  Tag,
  LogOut,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole, Permission } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  roles?: (UserRole | string)[] | (UserRole | string);
  additionalPermissions?: Permission[];
}

export default function Sidebar({
  roles = UserRole.ADMIN,
  additionalPermissions = [],
}: SidebarProps) {
  const userRoles = Array.isArray(roles) ? roles : [roles];

  const { checkPermission } = usePermissions(userRoles, additionalPermissions);
  const { toast } = useToast();
  const navigate = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    // Implement actual logout logic here
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate.push("/");
  };

  const sidebarItems = [
    {
      icon: <Home className="h-4 w-4" />,
      label: "Home",
      href: "/",
    },
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: "Products",
      href: "/admin/products",
    },
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: "POS",
      href: "/pos",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Customers",
      href: "/admin/customers",
    },
    {
      icon: <Coins className="h-4 w-4" />,
      label: "Transactions",
      href: "/admin/transactions",
    },
    {
      icon: <Tag className="h-4 w-4" />,
      label: "Discounts",
      href: "/admin/discounts",
    },
    {
      icon: <ListChecks className="h-4 w-4" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      href: "/admin/settings",
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className="peer inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[state=open]:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 border-right p-0 flex flex-col justify-between"
        >
          <div className="flex flex-col">
            <SheetHeader className="px-5 pt-4 pb-2.5">
              <SheetTitle>Dashboard</SheetTitle>
              <SheetDescription>
                Manage your store, products, customers, and more.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea >
              <div className="py-2">
                {sidebarItems.map((item) => (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className="group flex items-center gap-3 rounded-md px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </ScrollArea>
          </div>
          <SheetFooter logout={handleLogout} />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

interface SheetFooterProps {
  logout: () => void;
}

function SheetFooter({ logout }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center p-4 border-t neon-border",
        "justify-between"
      )}
    >
      <ThemeSwitcher />

      <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  );
}
