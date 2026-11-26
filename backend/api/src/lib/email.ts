/** Outbound transactional email. Swappable so tests and local dev never send real mail. */
export interface Mailer {
  send(message: { to: string; subject: string; html: string; text: string }): Promise<void>;
}

/** Sends through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email). */
export function createResendMailer(opts: { apiKey: string; from: string; fetchImpl?: typeof fetch }): Mailer {
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    async send({ to, subject, html, text }) {
      const res = await doFetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: opts.from, to: [to], subject, html, text }),
      });
      if (!res.ok) {
        // Resend's error body describes the problem; never includes the API key.
        throw new Error(`Resend rejected email (${res.status}): ${(await res.text()).slice(0, 300)}`);
      }
    },
  };
}

/** Local development: print the email (including any links) instead of sending it. */
export function createConsoleMailer(): Mailer {
  return {
    async send({ to, subject, text }) {
      console.log(JSON.stringify({ level: "info", msg: "email (not sent: RESEND_API_KEY unset)", to, subject, text }));
    },
  };
}

export function createMailer(env: { RESEND_API_KEY?: string; EMAIL_FROM: string; NODE_ENV: string }): Mailer {
  if (env.RESEND_API_KEY) return createResendMailer({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM });
  if (env.NODE_ENV === "production") {
    console.error(JSON.stringify({ level: "error", msg: "RESEND_API_KEY is not set: verification emails will not be delivered" }));
  }
  return createConsoleMailer();
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The sign-up confirmation email. */
export function verificationEmail(input: { name: string | null; link: string }) {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const text = `${greeting}

Please confirm your email address for ORION:
${input.link}

This link expires in 24 hours. If you didn't create an ORION account, you can ignore this email.`;
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0c1a17">
  <p>${escapeHtml(greeting)}</p>
  <p>Please confirm your email address for ORION.</p>
  <p style="margin:28px 0"><a href="${escapeHtml(input.link)}" style="background:#0c1a17;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;display:inline-block">Confirm my email</a></p>
  <p style="font-size:13px;color:#5b6b66">This link expires in 24 hours. If you didn't create an ORION account, you can ignore this email.</p>
</div>`;
  return { subject: "Confirm your email for ORION", html, text };
}
