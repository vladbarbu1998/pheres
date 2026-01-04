import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export function Logo({ className, inverted }: LogoProps) {
  return (
    <Link to="/" className={className}>
      <img 
        src={logoImage} 
        alt="Pheres" 
        className={cn(
          "h-6 w-auto lg:h-7 transition-all duration-300",
          inverted && "brightness-0 invert"
        )} 
      />
    </Link>
  );
}