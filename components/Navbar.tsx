"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Logo from "./Logo";
import LogoutButton from "./auth/LogoutButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTranslations } from "next-intl";

function Navbar({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };

    updateTime(); // Set immediately on mount
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div
      className="flex w-full justify-between mb-2 shadow-md bg-blue-50/70 dark:bg-white px-3 py-1"
      dir={t("dir")}
    >
      <div className="flex gap-2 justify-start items-center">
        {children}
        <Logo width={70} />
      </div>
      <div className="flex gap-2 justify-end items-center">
        {time !== null ? (
          <div className="duration-1000 animate-pulse-neon font-semibold text-black">
            {time}
          </div>
        ) : (
          <div className="font-semibold text-black">Loading...</div>
        )}
        <ThemeSwitcher />
        <LogoutButton />
      </div>
    </div>
  );
}

export default Navbar;
