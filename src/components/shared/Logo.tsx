import React from "react";
import Image from "@/lib/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  size = 100,
  className = "",
  onClick,
}) => {
  return (
    <Image
      src="/logo.png"
      alt="Aura CV Logo"
      width={size}
      height={size}
      className={cn("dark:invert", className)}
      onClick={onClick}
      priority={size >= 64}
    />
  );
};

export default Logo;