import type { Metadata } from "next";
import ForgotPasswordPage from "@/views/account/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your PHERES account password.",
  robots: { index: false },
};

export default function Page() {
  return <ForgotPasswordPage />;
}
