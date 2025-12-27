import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={className}>
      <img 
        src={logoImage} 
        alt="Pheres" 
        className="h-6 w-auto lg:h-7" 
      />
    </Link>
  );
}