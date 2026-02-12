import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export function TurnstileWidget({ onVerify, onExpire, onError, className }: TurnstileWidgetProps) {
  return (
    <div className={className}>
      <Turnstile
        sitekey={SITE_KEY}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
        theme="light"
        appearance="always"
      />
    </div>
  );
}
