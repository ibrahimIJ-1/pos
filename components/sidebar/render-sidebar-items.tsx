"use client";

import React, { useState } from "react";
import { SidebarItemType } from "../../lib/types/SidebarItemsType";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { useTranslations } from "next-intl";
export function renderSidebarItems(
  items: SidebarItemType[],
  level = 0,
  closeSidebar: (c: boolean) => void,
  {
    t,
    pathname,
    openItems,
    setOpenItems,
  }: {
    t: any;
    pathname: string;
    openItems: { [label: string]: boolean };
    setOpenItems: React.Dispatch<
      React.SetStateAction<{ [label: string]: boolean }>
    >;
  }
) {
  const isChildActive = (children: SidebarItemType[] = []): boolean => {
    return children.some(
      (child) =>
        (child.href && pathname.startsWith(child.href)) ||
        (child.children && isChildActive(child.children))
    );
  };

  function handleToggle(label: string) {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return items.map((item) => {
    const hasChildren = !!item.children?.length;
    const isActive =
      item.href &&
      (pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(item.href)));
    const isOpen = !!openItems[item.label];
    const highlightClass =
      isActive || isChildActive(item.children)
        ? "text-green-700 dark:text-green-800"
        : "";
    return (
      <React.Fragment key={item.label}>
        <Tooltip>
          <TooltipTrigger asChild>
            {item.href ? (
              <Link
                href={item.href}
                onClick={() => closeSidebar(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                  t("dir") == "rtl" && "justify-start flex-row-reverse",
                  level > 0 && "pl-10",
                  highlightClass // <-- highlight parent if child is active
                )}
              >
                {item.icon}
                <span>{t(item.label)}</span>
                {hasChildren && (
                  <button
                    type="button"
                    className="ml-auto"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggle(item.label);
                    }}
                  >
                    <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
                  </button>
                )}
              </Link>
            ) : (
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-md px-5 py-2 text-sm font-medium cursor-pointer",
                  t("dir") == "rtl" && "justify-start flex-row-reverse",
                  level > 0 && "pl-10"
                )}
                onClick={() => hasChildren && handleToggle(item.label)}
              >
                {item.icon}
                <span>{item.label}</span>
                {hasChildren && (
                  <span className="ml-auto text-xs">{isOpen ? "▲" : "▼"}</span>
                )}
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
        {hasChildren && isOpen && (
          <div>
            {renderSidebarItems(item.children!, level + 1, closeSidebar, {
              t,
              pathname,
              openItems,
              setOpenItems,
            })}
          </div>
        )}
      </React.Fragment>
    );
  });
}
