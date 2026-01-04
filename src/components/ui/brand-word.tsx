import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandWordProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

/**
 * BrandWord renders brand names (PHERES, Narcisa Pheres) in Times New Roman + uppercase.
 * Use this for all brand mentions to ensure consistent styling.
 */
export function BrandWord({ 
  children, 
  className, 
  as: Component = "span",
  ...props 
}: BrandWordProps) {
  return (
    <Component className={cn("brand-word", className)} {...props}>
      {children}
    </Component>
  );
}
