import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/file/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

const errors: Record<string, string> = {
  "missing-token": "That link was incomplete. Request a new one below.",
  "invalid-token": "That link has expired or was already used. Request a new one below.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errors[error] : undefined;

  return (
    <div className="form-page">
      <p className="eyebrow">Returning reader</p>
      <h1>Sign in by email</h1>
      <p>Enter the email you joined with and we&apos;ll send a one-time link that opens the file on this device.</p>
      {message && (
        <p className="notice notice-warn" role="alert">
          {message}
        </p>
      )}
      <SignInForm />
      <p className="small">
        Haven&apos;t joined yet? <Link href="/join">Join with your room&apos;s access code</Link>.
      </p>
    </div>
  );
}
