"use client";

import Link from "next/link";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={className}>
      <img 
        src={logoImage.src} 
        alt="Pheres" 
        className="h-6 w-auto lg:h-7" 
      />
    </Link>
  );
}