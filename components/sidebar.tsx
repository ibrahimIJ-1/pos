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
import { SidebarItemType } from "@/lib/types/SidebarItemsType";

interface SidebarProps {
  roles?: (UserRole | string)[] | (UserRole | string);
  additionalPermissions?: Permission[];
}

export default function Sidebar({
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
  const [currentSidebarItems, setCurrentSidebarItems] = useState<
    SidebarItemType[]
  >([]);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const sidebarItems = [
    // {
    //   icon: <Home className="h-4 w-4" />,
    //   label: t("Home"),
    //   href: "/",
    //   neededPermissions: [],
    // },
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: t("Dashboard"),
      href: "/admin",
      neededPermissions: [],
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: t("Products"),
      href: "/admin/products",
      neededPermissions: rolePermissions[UserRole.MANAGER],
    },
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: t("POS"),
      href: "/pos",
      neededPermissions: rolePermissions[UserRole.CASHIER],
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: t("Customers"),
      href: "/admin/customers",
      neededPermissions: rolePermissions[UserRole.MANAGER],
    },
    {
      icon: <Coins className="h-4 w-4" />,
      label: t("Transactions"),
      href: "/admin/transactions",
      neededPermissions: [
        ...rolePermissions[UserRole.ACCOUNTANT],
        rolePermissions[UserRole.MANAGER],
      ],
    },
    {
      icon: <Tag className="h-4 w-4" />,
      label: t("Discounts"),
      href: "/admin/discounts",
      neededPermissions: [
        ...rolePermissions[UserRole.ACCOUNTANT],
        rolePermissions[UserRole.MANAGER],
      ],
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: t("Refund Requests"),
      href: "/admin/refunds",
      neededPermissions: rolePermissions[UserRole.MANAGER],
    },
    {
      icon: <ComputerIcon className="h-4 w-4" />,
      label: t("Registers"),
      href: "/admin/registers",
      neededPermissions: [
        ...rolePermissions[UserRole.ACCOUNTANT],
        rolePermissions[UserRole.MANAGER],
      ],
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      label: t("Reports"),
      href: "/admin/reports",
      neededPermissions: [
        ...rolePermissions[UserRole.ACCOUNTANT],
        rolePermissions[UserRole.MANAGER],
      ],
    },
    {
      icon: <ListChecks className="h-4 w-4" />,
      label: t("Users"),
      href: "/admin/users",
      neededPermissions: rolePermissions[UserRole.OWNER],
    },
    {
      icon: <GitBranchIcon className="h-4 w-4" />,
      label: t("Branches"),
      href: "/admin/branches",
      neededPermissions: rolePermissions[UserRole.OWNER],
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: t("Settings"),
      href: "/admin/settings",
      neededPermissions: rolePermissions[UserRole.OWNER],
    },
  ];

  React.useEffect(() => {
    const filteredItems = sidebarItems.filter((item) => {
      if (item.neededPermissions.length === 0) return true;
      return item.neededPermissions.some((perm) =>
        permissions.has(perm as string)
      );
    });
    setCurrentSidebarItems(filteredItems);
  }, [permissions]);

  return (
    <TooltipProvider delayDuration={100}>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className={cn(
              "bg-transparent peer inline-flex items-start justify-center rounded-md p-2 text-gray-500 hover:bg-white hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[state=open]:bg-gray-800",
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
          className="h-[100vh] w-64 border-right p-0 flex flex-col justify-between"
        >
          <div
            className={cn(
              "flex flex-col rtl:direction-reverse overflow-y-scroll",
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
                {t("Dashboard")}
                <div>
                  <UserBranchSelector />
                </div>
              </SheetTitle>
              <SheetDescription
                className={cn("", t("dir") == "rtl" && "text-start")}
              >
                {t("Manage your store, products, customers, and more")}.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea>
              <div className="py-2">
                {currentSidebarItems.map((item) => {
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
              <SheetFooter />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

interface SheetFooterProps {}

function SheetFooter({}: SheetFooterProps) {
  const t = useTranslations();
  return (
    <div className="flex flex-col">
      <LanguageSwitcher />

      {/* <div
        className={cn(
          "flex items-center p-4 border-t neon-border rtl:flex-row-reverse",
          "justify-between"
        )}
      >
        <ThemeSwitcher />
      </div> */}
    </div>
  );
}
