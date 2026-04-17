import type { Metadata } from "next";
import RegisterPage from "@/views/account/Register";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your PHERES account.",
  robots: { index: false },
};

export default function Page() {
  return <RegisterPage />;
}
