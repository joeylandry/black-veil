import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/file/join-form";

export const metadata: Metadata = { title: "Join the file" };

export default function JoinPage() {
  return (
    <div className="form-page">
      <p className="eyebrow">Reader registration</p>
      <h1>Join the file</h1>
      <p>
        Your room has a six-character access code. Enter it with your name and email. The email is only used to send you a sign-in link if you open the
        file on another device.
      </p>
      <JoinForm />
      <p className="small">
        Already joined? <Link href="/sign-in">Sign in by email</Link>.
      </p>
    </div>
  );
}
