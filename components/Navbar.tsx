"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Logo from "./Logo";
import LogoutButton from "./auth/LogoutButton";

function Navbar({children}:{children:ReactNode}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div>
      <div className="flex w-full justify-between shadow-md rounded-t-md bg-blue-50/70 px-3 py-1">
        <div className="flex gap-2 justify-start items-center">
          {children}
          <Logo width={50} />
        </div>
        <div className="flex gap-2 justify-end items-center">
          <div className="duration-1000 animate-pulse-neon">{time.toLocaleTimeString()}</div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
