import type { Metadata } from "next";
import { AdminClaims } from "@/components/admin-claims";

export const metadata: Metadata = {
  title: "Staff Office",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="page-wrap admin-page">
      <AdminClaims />
    </div>
  );
}
