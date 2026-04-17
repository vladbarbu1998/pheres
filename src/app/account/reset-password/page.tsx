import type { Metadata } from "next";
import ResetPassword from "@/views/account/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your PHERES account.",
  robots: { index: false },
};

export default function Page() {
  return <ResetPassword />;
}
