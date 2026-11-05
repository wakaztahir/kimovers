// Sends an email (Resend) and a WhatsApp message for every new enquiry.
// Failures are logged in D1 and never block the form submission.

import { type NotificationSettings, loadSettings } from "./settings";

export interface SubmissionSummary {
  id: string;
  kind: string;
  submittedAt: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  size: string;
  from: string;
  to: string;
  date: string;
  message: string;
}

export type Channel = "email" | "whatsapp";
export type Status = "sent" | "skipped" | "failed";

export interface DeliveryResult {
  channel: Channel;
  status: Status;
  detail: string;
}

const GRAPH_VERSION = "v22.0";
const REQUEST_TIMEOUT_MS = 10_000;

function textLines(summary: SubmissionSummary, origin: string): string[] {
  const kind = summary.kind === "quote" ? "Quote request" : "Contact message";
  const lines = [`New ${kind} — ${summary.name}`, `Phone: ${summary.phone}`];
  if (summary.email) lines.push(`Email: ${summary.email}`);
  if (summary.service) lines.push(`Service: ${summary.service}`);
  if (summary.size) lines.push(`Size: ${summary.size}`);
  if (summary.from || summary.to) lines.push(`Route: ${summary.from || "—"} → ${summary.to || "—"}`);
  if (summary.date) lines.push(`Moving date: ${summary.date}`);
  if (summary.message) lines.push("", summary.message);
  lines.push("", `Reference ${summary.id.slice(0, 8)}`, `${origin}/admin`);
  return lines;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailHtml(summary: SubmissionSummary, origin: string): string {
  const rows: [string, string][] = [
    ["Type", summary.kind === "quote" ? "Quote request" : "Contact message"],
    ["Name", summary.name],
    ["Phone", summary.phone],
    ["Email", summary.email],
    ["Service", summary.service],
    ["Property size", summary.size],
    ["Moving from", summary.from],
    ["Moving to", summary.to],
    ["Moving date", summary.date],
    ["Message", summary.message],
    ["Received", summary.submittedAt]
  ];
  const body = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 14px 6px 0;color:#5b7280;font-weight:600;vertical-align:top">${escapeHtml(
          label
        )}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  return `<div style="font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#12222b">
  <h2 style="margin:0 0 4px;font-size:19px">New ${summary.kind === "quote" ? "quote request" : "message"} from the website</h2>
  <table style="border-collapse:collapse;margin:14px 0">${body}</table>
  <p style="margin:18px 0 0"><a href="${origin}/admin" style="color:#0b6b8a">Open the admin panel</a></p>
</div>`;
}

async function sendEmail(settings: NotificationSettings, summary: SubmissionSummary, origin: string): Promise<DeliveryResult> {
  if (!settings.emailEnabled) return { channel: "email", status: "skipped", detail: "Email notifications are turned off." };
  if (!settings.resendApiKey) return { channel: "email", status: "failed", detail: "No Resend API key saved." };
  if (!settings.resendFrom) return { channel: "email", status: "failed", detail: "No sender address saved." };
  if (!settings.emailTo) return { channel: "email", status: "failed", detail: "No notification address saved." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${settings.resendApiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: settings.resendFrom,
      to: [settings.emailTo],
      reply_to: summary.email || undefined,
      subject: `New ${summary.kind === "quote" ? "quote request" : "message"} — ${summary.name}`,
      html: emailHtml(summary, origin),
      text: textLines(summary, origin).join("\n")
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    const body = (await response.text().catch(() => "")).slice(0, 300);
    return { channel: "email", status: "failed", detail: `Resend responded ${response.status}. ${body}`.trim() };
  }
  return { channel: "email", status: "sent", detail: `Sent to ${settings.emailTo}.` };
}

async function sendWhatsapp(
  settings: NotificationSettings,
  summary: SubmissionSummary,
  origin: string
): Promise<DeliveryResult> {
  if (!settings.whatsappEnabled) {
    return { channel: "whatsapp", status: "skipped", detail: "WhatsApp notifications are turned off." };
  }

  const text = textLines(summary, origin).join("\n");

  if (settings.whatsappProvider === "callmebot") {
    if (!settings.callmebotPhone || !settings.callmebotApiKey) {
      return { channel: "whatsapp", status: "failed", detail: "CallMeBot phone or API key is missing." };
    }
    const url = new URL("https://api.callmebot.com/whatsapp.php");
    url.searchParams.set("phone", settings.callmebotPhone);
    url.searchParams.set("apikey", settings.callmebotApiKey);
    url.searchParams.set("text", text);
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) {
      return { channel: "whatsapp", status: "failed", detail: `CallMeBot responded ${response.status}.` };
    }
    return { channel: "whatsapp", status: "sent", detail: `Sent to ${settings.callmebotPhone}.` };
  }

  if (!settings.whatsappPhoneNumberId || !settings.whatsappToken || !settings.whatsappTo) {
    return {
      channel: "whatsapp",
      status: "failed",
      detail: "WhatsApp phone number ID, access token or recipient is missing."
    };
  }

  // Template messages are the only way to start a WhatsApp conversation.
  const body = settings.whatsappTemplate
    ? {
        messaging_product: "whatsapp",
        to: settings.whatsappTo,
        type: "template",
        template: {
          name: settings.whatsappTemplate,
          language: { code: settings.whatsappTemplateLang || "en" },
          components: [
            {
              type: "body",
              parameters: [summary.name, summary.kind === "quote" ? "quote" : "message", summary.phone].map((value) => ({
                type: "text",
                text: value.slice(0, 120)
              }))
            }
          ]
        }
      }
    : {
        messaging_product: "whatsapp",
        to: settings.whatsappTo,
        type: "text",
        text: { preview_url: false, body: text.slice(0, 4000) }
      };

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(settings.whatsappPhoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${settings.whatsappToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    }
  );

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    return { channel: "whatsapp", status: "failed", detail: `WhatsApp responded ${response.status}. ${detail}`.trim() };
  }
  return { channel: "whatsapp", status: "sent", detail: `Sent to ${settings.whatsappTo}.` };
}

async function logResult(env: Env, submissionId: string, result: DeliveryResult): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO notification_log (id, submission_id, channel, status, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(crypto.randomUUID(), submissionId, result.channel, result.status, result.detail.slice(0, 500), new Date().toISOString())
      .run();
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "notification_log_failed",
        error: error instanceof Error ? error.message : String(error)
      })
    );
  }
}

async function runChannel(
  channel: Channel,
  summary: SubmissionSummary,
  origin: string,
  settings: NotificationSettings
): Promise<DeliveryResult> {
  try {
    return channel === "email" ? await sendEmail(settings, summary, origin) : await sendWhatsapp(settings, summary, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { channel, status: "failed", detail: message.slice(0, 300) };
  }
}

/** Sends both channels in parallel and records each outcome. */
export async function notifySubmission(
  env: Env,
  submission: SubmissionSummary,
  origin: string
): Promise<DeliveryResult[]> {
  const settings = await loadSettings(env);
  const results = await Promise.all([
    runChannel("email", submission, origin, settings),
    runChannel("whatsapp", submission, origin, settings)
  ]);
  await Promise.all(results.map((result) => logResult(env, submission.id, result)));
  for (const result of results) {
    if (result.status === "failed") {
      console.error(JSON.stringify({ message: "notification_failed", channel: result.channel, detail: result.detail }));
    }
  }
  return results;
}

/** Used by the "send test" buttons in the admin settings page. */
export async function sendTestNotification(env: Env, channel: Channel, origin: string): Promise<DeliveryResult> {
  const settings = await loadSettings(env);
  const summary: SubmissionSummary = {
    id: `test-${Date.now()}`,
    kind: "contact",
    submittedAt: new Date().toISOString(),
    name: "Test notification",
    phone: "+971 55 793 0734",
    email: "",
    service: "Apartment moving",
    size: "1 bedroom",
    from: "Dubai Marina",
    to: "Business Bay",
    date: "2026-12-01",
    message: "This is a test message from the KI Movers admin panel."
  };
  const result = await runChannel(channel, summary, origin, settings);
  await logResult(env, summary.id, result);
  return result;
}
