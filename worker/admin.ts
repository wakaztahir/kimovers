import { escapeHtml } from "../src/site/html";

const PAGE_LIMIT = 50;

interface SubmissionRow {
  id: string;
  kind: string;
  submitted_at: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  service: string;
  property_size: string;
  moving_from: string;
  moving_to: string;
  moving_date: string;
  extras: string;
  whatsapp: string;
  comments: string;
  payload: string;
}

const PAGE_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function pageHeaders(extra: Readonly<Record<string, string>> = {}): Headers {
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": PAGE_CSP
  });
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return headers;
}

function textResponse(message: string, status: number, extra: Readonly<Record<string, string>> = {}): Response {
  const headers = pageHeaders(extra);
  headers.set("content-type", "text/plain; charset=utf-8");
  return new Response(`${message}\n`, { status, headers });
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

/** Compares two strings in constant time, independent of their length. */
async function secureEquals(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([digest(left), digest(right)]);
  let difference = 0;
  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= (leftDigest[index] ?? 0) ^ (rightDigest[index] ?? 0);
  }
  return difference === 0;
}

interface BasicCredentials {
  username: string;
  password: string;
}

function readBasicAuth(header: string | null): BasicCredentials | null {
  if (!header) return null;
  const [scheme, encoded] = header.split(" ");
  if (!encoded || scheme?.toLowerCase() !== "basic") return null;

  let decoded: string;
  try {
    decoded = atob(encoded.trim());
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return null;
  return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function prettyPayload(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2) ?? raw;
  } catch {
    return raw;
  }
}

function renderRow(row: SubmissionRow): string {
  const phone = row.phone ? `<div><a href="tel:${escapeHtml(row.phone)}">${escapeHtml(row.phone)}</a></div>` : "";
  const email = row.email ? `<div><a href="mailto:${escapeHtml(row.email)}">${escapeHtml(row.email)}</a></div>` : "";
  const whatsapp =
    row.whatsapp && row.whatsapp !== row.phone
      ? `<div class="muted">WhatsApp: ${escapeHtml(row.whatsapp)}</div>`
      : "";
  const service = row.service ? `<strong>${escapeHtml(row.service)}</strong>` : "";
  const size = row.property_size ? `<div class="muted">${escapeHtml(row.property_size)}</div>` : "";
  const route =
    row.moving_from || row.moving_to
      ? `<div>${escapeHtml(row.moving_from || "—")} <span class="muted">to</span> ${escapeHtml(row.moving_to || "—")}</div>`
      : "";
  const moveDate = row.moving_date ? `<div class="muted">${escapeHtml(row.moving_date)}</div>` : "";
  const notes = [row.message, row.comments, row.extras ? `Extras: ${row.extras}` : ""].filter(Boolean).join("\n");
  const kindClass = row.kind === "quote" ? "quote" : "contact";

  return `<tr>
      <td class="nowrap">${escapeHtml(formatTimestamp(row.submitted_at))}</td>
      <td><span class="tag ${kindClass}">${escapeHtml(row.kind)}</span></td>
      <td><strong>${escapeHtml(row.name || "—")}</strong>${phone}${email}${whatsapp}</td>
      <td>${service}${size}${route}${moveDate}</td>
      <td>${notes ? `<div class="note">${escapeHtml(notes)}</div>` : '<span class="muted">—</span>'}</td>
      <td><details><summary>JSON</summary><pre>${escapeHtml(prettyPayload(row.payload))}</pre></details></td>
    </tr>`;
}

function renderPage(rows: readonly SubmissionRow[], total: number): string {
  const body =
    rows.length > 0
      ? `<table>
      <thead><tr><th>Received</th><th>Type</th><th>Person</th><th>Move</th><th>Notes</th><th>Raw</th></tr></thead>
      <tbody>
    ${rows.map(renderRow).join("\n    ")}
      </tbody>
    </table>`
      : '<p class="empty">No enquiries yet.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Enquiries | KI Movers admin</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #12222b; background: #f4f7f9; }
  header { background: #10222c; color: #fff; padding: 20px 24px; display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: baseline; }
  header h1 { margin: 0; font-size: 20px; }
  header p { margin: 0; color: #a9c2cc; font-size: 14px; }
  header a { margin-left: auto; color: #9fd8e8; font-size: 14px; }
  main { padding: 24px; overflow-x: auto; }
  table { width: 100%; min-width: 960px; border-collapse: collapse; background: #fff; }
  th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid #e2e9ed; }
  th { position: sticky; top: 0; background: #eef4f7; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #47606c; }
  tbody tr:last-child td { border-bottom: 0; }
  a { color: #0b6b8a; }
  .muted { color: #6d8490; font-size: 13px; }
  .nowrap { white-space: nowrap; }
  .note { max-width: 320px; white-space: pre-wrap; }
  details summary { cursor: pointer; color: #0b6b8a; font-size: 13px; }
  pre { max-width: 360px; max-height: 320px; overflow: auto; margin: 8px 0 0; padding: 10px; border-radius: 6px; background: #f4f7f9; font-size: 12px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #e8eef2; }
  .tag.quote { background: #dff0f6; color: #0b5d76; }
  .tag.contact { background: #e9e6f8; color: #4b3f86; }
  .empty { padding: 40px; text-align: center; color: #6d8490; background: #fff; }
  footer { padding: 0 24px 24px; color: #6d8490; font-size: 13px; }
</style>
</head>
<body>
<header>
  <h1>Enquiries</h1>
  <p>${total} total &middot; showing the latest ${rows.length}</p>
  <a href="/">View site</a>
</header>
<main>${body}</main>
<footer>Quote and contact form submissions, newest first. Limit ${PAGE_LIMIT}.</footer>
</body>
</html>`;
}

async function loadSubmissions(env: Env): Promise<{ rows: SubmissionRow[]; total: number }> {
  const [list, count] = await Promise.all([
    env.DB.prepare(
      `SELECT id, kind, submitted_at, name, phone, email, message, service,
        property_size, moving_from, moving_to, moving_date, extras, whatsapp,
        comments, payload
      FROM submissions
      ORDER BY submitted_at DESC
      LIMIT ?`
    )
      .bind(PAGE_LIMIT)
      .all<SubmissionRow>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM submissions").first<{ total: number }>()
  ]);

  return { rows: list.results ?? [], total: count?.total ?? 0 };
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return textResponse("Method not allowed.", 405, { allow: "GET, HEAD" });
  }

  const username = env.ADMIN_USERNAME?.trim();
  const password = env.ADMIN_PASSWORD;
  if (!username || !password) {
    return textResponse(
      "Admin access is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD with `npx wrangler secret put`, or in .dev.vars for local development.",
      503
    );
  }

  const credentials = readBasicAuth(request.headers.get("authorization"));
  if (!credentials) {
    return textResponse("Authentication required.", 401, {
      "www-authenticate": 'Basic realm="KI Movers admin", charset="UTF-8"'
    });
  }

  const usernameMatches = await secureEquals(credentials.username, username);
  const passwordMatches = await secureEquals(credentials.password, password);
  if (!usernameMatches || !passwordMatches) {
    return textResponse("Authentication required.", 401, {
      "www-authenticate": 'Basic realm="KI Movers admin", charset="UTF-8"'
    });
  }

  let submissions: { rows: SubmissionRow[]; total: number };
  try {
    submissions = await loadSubmissions(env);
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "admin_query_failed",
        error: error instanceof Error ? error.message : String(error)
      })
    );
    return textResponse("Could not load submissions.", 500);
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers: pageHeaders() });
  }

  return new Response(renderPage(submissions.rows, submissions.total), { status: 200, headers: pageHeaders() });
}
