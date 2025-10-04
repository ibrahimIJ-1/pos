"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

import { usePermissions } from "@/hooks/usePermissions";
import { UserRole, Permission } from "@/lib/permissions";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UserBranchSelector from "../branch/UserBranchSelector";
import { useTranslations } from "next-intl";
import Logo from "../Logo";
import { SidebarItemType } from "@/lib/types/SidebarItemsType";
import { renderSidebarItems } from "@/components/sidebar/render-sidebar-items";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
  roles?: (UserRole | string)[] | (UserRole | string);
  additionalPermissions?: Permission[];
  title?: string;
  description?: string;
  canShowBranches?: boolean;
  sidebarItems: SidebarItemType[];
}

export default function Sidebar({
  roles = "",
  additionalPermissions = [],
  title = "Dashboard",
  description = "Manage your store, products, customers, and more",
  canShowBranches = false,
  sidebarItems = [],
}: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<{ [label: string]: boolean }>({});
  const userRoles = Array.isArray(roles) ? roles : [roles];
  const { logout, permissions } = useAuth();
  const { checkPermission } = usePermissions(userRoles, additionalPermissions);
  const [currentSidebarItems, setCurrentSidebarItems] = useState<
    SidebarItemType[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    const filteredItems = sidebarItems.filter((item) => {
      if (item.neededPermissions.length === 0) return true;
      return item.neededPermissions.some((perm) =>
        permissions.has(perm as string)
      );
    });
    setCurrentSidebarItems(filteredItems);
  }, [permissions]);

  React.useEffect(() => {
    // Find all items that should be open (i.e., have an active child)
    function getOpenItems(
      items: SidebarItemType[],
      acc: { [label: string]: boolean } = {}
    ) {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          // Recursively check children
          const childActive = item.children.some(
            (child) =>
              (child.href && pathname.startsWith(child.href)) ||
              (child.children && getOpenItems([child]))
          );
          if (childActive) {
            acc[item.label] = true;
          }
          getOpenItems(item.children, acc);
        }
      }
      return acc;
    }
    setOpenItems(getOpenItems(currentSidebarItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentSidebarItems]);

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
              "flex flex-col rtl:direction-reverse overflow-y-scroll [scroll-bar:none] [-ms-overflow-style:none] [scrollbar-width:none]",
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
                {t(title)}
                {canShowBranches && (
                  <div>
                    <UserBranchSelector />
                  </div>
                )}
              </SheetTitle>
              <SheetDescription
                className={cn("", t("dir") == "rtl" && "text-start")}
              >
                {t(description)}.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea>
              <div className="py-2">
                {renderSidebarItems(currentSidebarItems, 0, setIsSidebarOpen, {
                  t,
                  pathname,
                  openItems,
                  setOpenItems,
                })}
              </div>
              <SidebarFooter />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
