import { handleAdmin } from "./admin";
import { notifySubmission } from "./notify";

type SubmissionKind = "quote" | "contact";

const REQUIRED_FIELDS: Readonly<Record<SubmissionKind, readonly string[]>> = {
  quote: ["name", "phone", "email", "service", "from", "to", "date"],
  contact: ["name", "phone", "email", "message"]
};

const MAX_BODY_BYTES = 30_000;

class BodyTooLargeError extends Error {
  constructor() {
    super("Request is too large.");
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

async function readBodyText(request: Request): Promise<string> {
  const body = request.body;
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) throw new BodyTooLargeError();
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
  return text + decoder.decode();
}

async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const text = await readBodyText(request);
  const parsed: unknown = JSON.parse(text || "{}");
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
  return parsed as Record<string, unknown>;
}

/** Mirrors the browser validation: values are trimmed and treated as text. */
function fieldValue(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value === "string") return value.trim();
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

async function handleSubmission(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  kind: SubmissionKind
): Promise<Response> {
  let data: Record<string, unknown>;
  try {
    data = await readJsonObject(request);
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unable to save request.";
    return jsonResponse({ error: message }, 400);
  }

  const missing = REQUIRED_FIELDS[kind].filter((key) => !fieldValue(data, key));
  if (missing.length > 0) {
    return jsonResponse({ error: "Please complete all required fields.", fields: missing }, 422);
  }

  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const record = { ...data, id, kind, submittedAt };

  try {
    await env.DB.prepare(
      `INSERT INTO submissions (
        id, kind, submitted_at, name, phone, email, message, service,
        property_size, moving_from, moving_to, moving_date, extras, whatsapp,
        comments, payload, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        kind,
        submittedAt,
        fieldValue(data, "name"),
        fieldValue(data, "phone"),
        fieldValue(data, "email"),
        fieldValue(data, "message"),
        fieldValue(data, "service"),
        fieldValue(data, "size"),
        fieldValue(data, "from"),
        fieldValue(data, "to"),
        fieldValue(data, "date"),
        fieldValue(data, "extras"),
        fieldValue(data, "whatsapp"),
        fieldValue(data, "comments"),
        JSON.stringify(record),
        request.headers.get("user-agent") ?? ""
      )
      .run();
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "submission_insert_failed",
        kind,
        error: error instanceof Error ? error.message : String(error)
      })
    );
    return jsonResponse({ error: "Unable to save request." }, 500);
  }

  // Alerts run after the response is sent, so a slow or failing provider never
  // delays the form. Each attempt is recorded in notification_log.
  ctx.waitUntil(
    notifySubmission(
      env,
      {
        id,
        kind,
        submittedAt,
        name: fieldValue(data, "name"),
        phone: fieldValue(data, "phone"),
        email: fieldValue(data, "email"),
        service: fieldValue(data, "service"),
        size: fieldValue(data, "size"),
        from: fieldValue(data, "from"),
        to: fieldValue(data, "to"),
        date: fieldValue(data, "date"),
        message: [fieldValue(data, "message"), fieldValue(data, "comments")].filter(Boolean).join("\n")
      },
      new URL(request.url).origin
    ).catch((error: unknown) => {
      console.error(
        JSON.stringify({
          message: "notification_dispatch_failed",
          error: error instanceof Error ? error.message : String(error)
        })
      );
    })
  );

  return jsonResponse({ ok: true, id }, 201);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/quote") {
      return handleSubmission(request, env, ctx, "quote");
    }
    if (request.method === "POST" && url.pathname === "/api/contact") {
      return handleSubmission(request, env, ctx, "contact");
    }
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdmin(request, env);
    }

    // Everything else is a static asset. Unmatched page routes fall back to
    // index.html because not_found_handling is set to single-page-application.
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
