import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={className}>
      {/* 
        Replace this text with your image logo:
        <img src="/logo.svg" alt="Pheres" className="h-8 w-auto" />
        
        Or import from assets:
        import logoImage from "@/assets/logo.svg";
        <img src={logoImage} alt="Pheres" className="h-8 w-auto" />
      */}
      <span className="font-display text-xl font-semibold tracking-[0.2em] text-foreground lg:text-2xl">
        PHERES
      </span>
    </Link>
  );
}