"use client";

import dynamic from "next/dynamic";

const Turnstile = dynamic(() => import("react-turnstile"), { ssr: false });

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

export function TurnstileWidget({ onVerify, onExpire, onError, className }: TurnstileWidgetProps) {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) return null;
  }

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
