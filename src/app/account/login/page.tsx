import type { Metadata } from "next";
import LoginPage from "@/views/account/Login";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PHERES account.",
  robots: { index: false },
};

export default function Page() {
  return <LoginPage />;
}
