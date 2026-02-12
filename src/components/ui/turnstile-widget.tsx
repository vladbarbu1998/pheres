import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export function TurnstileWidget({ onVerify, onExpire, onError, className }: TurnstileWidgetProps) {
  if (isLocalhost) return null;

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
