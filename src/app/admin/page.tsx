import type { Metadata } from "next";
import AdminEntry from "@/views/admin/AdminEntry";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default function Page() {
  return <AdminEntry />;
}
