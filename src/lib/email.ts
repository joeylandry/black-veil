/**
 * Sends the sign-in link through Resend when RESEND_API_KEY is set. Without it (local
 * development) the link is printed to the server console instead.
 */
export async function sendMagicLinkEmail(to: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "File 245 <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[dev] Sign-in link for ${to}: ${url}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "Your way back into File 245",
      html: `<p>Use this link to reopen File 245 on this device:</p><p><a href="${url}">${url}</a></p><p>It works once and expires in 30 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to send sign-in email (${response.status}): ${body}`);
  }
}
