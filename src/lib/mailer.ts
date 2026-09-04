/**
 * Outbound email.
 *
 * No provider is wired up yet. Rather than pretend a mail was sent, this
 * module reports whether it was actually delivered, and in development it
 * surfaces the link so the flow can be tested locally.
 *
 * To go live, set RESEND_API_KEY (or swap in SES/Postmark/SMTP inside
 * `deliver`) — everything above this layer already works.
 */

export type MailResult = {
  /** True only when a provider actually accepted the message. */
  delivered: boolean;
  /** Present only in development when no provider is configured. */
  devPreviewUrl?: string;
};

function isMailerConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function deliver(params: { to: string; subject: string; html: string; text: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "OriginLife <noreply@originlife.co>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Mail provider rejected the message (${res.status})`);
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<MailResult> {
  const { to, name, resetUrl } = params;
  const subject = "Reset your OriginLife password";
  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your OriginLife password.",
    "Open the link below to choose a new one. It expires in 1 hour.",
    "",
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email — your password stays unchanged.",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#121317">
      <h1 style="font-size:20px;margin:0 0 16px">Reset your password</h1>
      <p style="color:#45474d;line-height:1.6">Hi ${name}, we received a request to reset your OriginLife password.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#121317;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Choose a new password</a>
      </p>
      <p style="color:#7d818a;font-size:13px;line-height:1.6">This link expires in 1 hour and can only be used once. If you didn't request it, you can ignore this email — your password stays unchanged.</p>
    </div>`;

  if (isMailerConfigured()) {
    await deliver({ to, subject, html, text });
    return { delivered: true };
  }

  // No provider configured. Log it so the link is recoverable from the server
  // console, and only hand it back to the browser outside production.
  console.warn(
    `[mailer] No RESEND_API_KEY set — password reset email not sent to ${to}.\n` +
      `[mailer] Reset link: ${resetUrl}`
  );

  return {
    delivered: false,
    ...(process.env.NODE_ENV === "production" ? {} : { devPreviewUrl: resetUrl }),
  };
}
