import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConsentToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function ConsentToggle({ checked, onCheckedChange, error }: ConsentToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <Switch
          id="consent"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={error ? "border-destructive" : ""}
        />
        <Label htmlFor="consent" className="text-sm leading-tight text-muted-foreground cursor-pointer">
          I agree to the{" "}
          <Link to="/terms" className="text-foreground underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy-policy" className="text-foreground underline hover:text-primary">
            Privacy Policy
          </Link>
        </Label>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
