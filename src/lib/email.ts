/**
 * Sends transactional email via the Resend API if RESEND_API_KEY is configured.
 * Without it (local dev), logs the message and link to the server console instead
 * so the sign-in flow is testable without an email provider.
 */
export async function sendMagicLinkEmail(to: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "The Black Veil <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[dev] Magic link for ${to}: ${url}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your Black Veil sign-in link",
      html: `<p>Use this link to return to your guest register, standing, and trials:</p><p><a href="${url}">${url}</a></p><p>This link expires in 30 minutes and can only be used once.</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to send magic link email (${response.status}): ${body}`);
  }
}
