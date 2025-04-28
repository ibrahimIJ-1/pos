import Image from "next/image";
import React from "react";
const icon = await import("@/public/logo.png");

function Logo({
  width = 150,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return <Image src={icon} alt="logo" width={width} className={className} />;
}

export default Logo;
