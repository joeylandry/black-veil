import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata: Metadata = { title: "Staff" };

export default function AdminPage() {
  return (
    <div className="admin-page">
      <p className="eyebrow">Staff only</p>
      <h1>The records office</h1>
      <AdminConsole />
    </div>
  );
}
