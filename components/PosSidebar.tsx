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
  ComputerIcon,
  GitBranchIcon,
  Receipt,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole, Permission, rolePermissions } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UserBranchSelector from "./branch/UserBranchSelector";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./language-switcher/LanguageSwitcher";
import Logo from "./Logo";

interface SidebarProps {
  roles?: (UserRole | string)[] | (UserRole | string);
  additionalPermissions?: Permission[];
}

export default function POSSidebar({
  roles = UserRole.ADMIN,
  additionalPermissions = [],
}: SidebarProps) {
  const t = useTranslations();
  const userRoles = Array.isArray(roles) ? roles : [roles];
  const { logout, permissions } = useAuth();
  const { checkPermission } = usePermissions(userRoles, additionalPermissions);
  const { toast } = useToast();
  const navigate = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    // Implement actual logout logic here
    logout();
    navigate.push("/auth/login");
  };

  const sidebarItems = [
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: t("POS"),
      href: "/pos",
      neededPermissions: rolePermissions[UserRole.CASHIER],
    },
    // {
    //   icon: <ShoppingCart className="h-4 w-4" />,
    //   label: t("Refund"),
    //   href: "/pos",
    //   neededPermissions: rolePermissions[UserRole.CASHIER],
    // },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="top-0 ltr:left-0 rtl:right-0">
          <button
            aria-label="Open navigation menu"
            className={cn(
              "bg-white peer inline-flex items-start justify-center rounded-md p-2 text-gray-500 hover:bg-white hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[state=open]:bg-gray-800",
              t("dir") == "rtl" && "flex justify-end"
            )}
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
          side={t("dir") == "ltr" ? "left" : "right"}
          className="w-64 border-right p-0 flex flex-col justify-between"
        >
          <div
            className={cn(
              "flex flex-col rtl:direction-reverse",
              t("dir") == "rtl" && ""
            )}
            dir={t("dir")}
          >
            <SheetHeader
              className={cn(
                "px-5 pt-4 pb-2.5",
                t("dir") == "rtl" && "text-start"
              )}
            >
              <SheetTitle>
                <Logo width={120} className="mb-3 animate-pulse-neon" />
                {t("POS System")}
                <div>
                  <UserBranchSelector />
                </div>
              </SheetTitle>
              <SheetDescription
                className={cn("", t("dir") == "rtl" && "text-start")}
              >
                {t("Sale Or Refund your products, make a happy customer")}.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea>
              <div className="py-2">
                {sidebarItems.map((item) => {
                  if (
                    item.neededPermissions.length == 0 ||
                    item.neededPermissions.some((perm) =>
                      permissions.has(perm as string)
                    )
                  )
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            onClick={closeSidebar}
                            className={cn(
                              "group flex items-center gap-3 rounded-md px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                              t("dir") == "rtl" &&
                                "justify-start flex-row-reverse"
                            )}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>{item.label}</TooltipContent>
                      </Tooltip>
                    );
                })}
              </div>
              <SheetFooter logout={handleLogout} />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

interface SheetFooterProps {
  logout: () => void;
}

function SheetFooter({ logout }: SheetFooterProps) {
  const t = useTranslations();
  return (
    <div className="flex flex-col">
      <LanguageSwitcher />

      <div
        className={cn(
          "flex items-center p-4 border-t neon-border rtl:flex-row-reverse",
          "justify-between"
        )}
      >
        {/* <ThemeSwitcher /> */}

        <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          <span>{t("Logout")}</span>
        </Button>
      </div>
    </div>
  );
}
