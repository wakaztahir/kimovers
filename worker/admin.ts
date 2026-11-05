import { escapeHtml } from "../src/site/html";
import { type Channel, sendTestNotification } from "./notify";
import { hasSession, createSession, destroySession, isSameOrigin } from "./session";
import { loadSettings, saveSettings } from "./settings";

const PAGE_LIMIT = 50;
const MAX_FORM_BYTES = 20_000;

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

interface Notice {
  tone: "ok" | "error";
  message: string;
}

const PAGE_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

const SHARED_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color: #12222b; background: #f4f7f9; }
  a { color: #0b6b8a; }
  header.top { background: #071521; color: #fff; padding: 18px 24px; display: flex; flex-wrap: wrap; gap: 8px 22px; align-items: center; }
  header.top h1 { margin: 0; font-size: 18px; letter-spacing: -.02em; }
  header.top nav { display: flex; gap: 18px; margin-left: auto; align-items: center; }
  header.top nav a, header.top nav button { color: #a9c2cc; font-size: 14px; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; }
  header.top nav a:hover, header.top nav button:hover { color: #fff; }
  header.top nav a[aria-current="page"] { color: #fff; }
  main { padding: 24px; overflow-x: auto; }
  h2 { margin: 0 0 4px; font-size: 20px; letter-spacing: -.02em; }
  .lede { margin: 0 0 22px; color: #5b7280; font-size: 14px; }
  table { width: 100%; min-width: 960px; border-collapse: collapse; background: #fff; }
  th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid #e2e9ed; }
  th { position: sticky; top: 0; background: #eef4f7; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #47606c; }
  tbody tr:last-child td { border-bottom: 0; }
  .muted { color: #6d8490; font-size: 13px; }
  .nowrap { white-space: nowrap; }
  .note { max-width: 320px; white-space: pre-wrap; }
  details summary { cursor: pointer; color: #0b6b8a; font-size: 13px; }
  pre { max-width: 360px; max-height: 320px; overflow: auto; margin: 8px 0 0; padding: 10px; border-radius: 6px; background: #f4f7f9; font-size: 12px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #e8eef2; }
  .tag.quote { background: #dff0f6; color: #0b5d76; }
  .tag.contact { background: #e9e6f8; color: #4b3f86; }
  .tag.sent { background: #ddf3e4; color: #1c6b3a; }
  .tag.failed { background: #fbe4e0; color: #9d3027; }
  .tag.skipped { background: #eef1f3; color: #52646e; }
  .empty { padding: 40px; text-align: center; color: #6d8490; background: #fff; }
  footer.bottom { padding: 0 24px 28px; color: #6d8490; font-size: 13px; }
  .notice { margin: 0 0 18px; padding: 12px 14px; border-radius: 8px; font-size: 14px; }
  .notice.ok { background: #e2f5e9; color: #1c5f37; }
  .notice.error { background: #fbe7e3; color: #8f2a21; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; align-items: start; }
  .card { background: #fff; border: 1px solid #e2e9ed; border-radius: 10px; padding: 20px; }
  .card h3 { margin: 0 0 3px; font-size: 16px; }
  .card p.hint { margin: 0 0 16px; color: #6d8490; font-size: 13px; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: #344f62; margin-bottom: 5px; letter-spacing: .01em; }
  .field input[type=text], .field input[type=password], .field select {
    width: 100%; padding: 10px 11px; border: 1px solid #cfdde4; border-radius: 7px; background: #fff; color: #12222b; font: inherit;
  }
  .field input:focus, .field select:focus { outline: 2px solid #8fd0dd; outline-offset: 1px; border-color: #4aa8bb; }
  .field small { display: block; color: #6d8490; font-size: 12px; margin-top: 5px; }
  .check { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 14px; font-size: 14px; }
  .check input { margin-top: 3px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  button.primary, button.secondary { font: inherit; font-weight: 600; padding: 10px 16px; border-radius: 7px; cursor: pointer; border: 1px solid transparent; }
  button.primary { background: #0b6b8a; color: #fff; }
  button.primary:hover { background: #085874; }
  button.secondary { background: #fff; color: #0b5d76; border-color: #b9d2db; }
  button.secondary:hover { background: #eef7fa; }
`;

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

function redirect(location: string, cookie?: string): Response {
  const headers = pageHeaders();
  headers.set("location", location);
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

function html(body: string, status = 200, extra: Readonly<Record<string, string>> = {}): Response {
  return new Response(body, { status, headers: pageHeaders(extra) });
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

async function readForm(request: Request): Promise<URLSearchParams> {
  const text = await request.text();
  if (text.length > MAX_FORM_BYTES) throw new Error("Form is too large.");
  return new URLSearchParams(text);
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

function layout(options: { title: string; active: "enquiries" | "settings"; body: string; footer?: string }): string {
  const nav = `
    <nav>
      <a href="/admin"${options.active === "enquiries" ? ' aria-current="page"' : ""}>Enquiries</a>
      <a href="/admin/settings"${options.active === "settings" ? ' aria-current="page"' : ""}>Settings</a>
      <a href="/" target="_blank" rel="noopener">View site</a>
      <form method="post" action="/admin/logout" style="margin:0"><button type="submit">Sign out</button></form>
    </nav>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(options.title)} | KI Movers admin</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<header class="top"><h1>KI Movers admin</h1>${nav}</header>
<main>${options.body}</main>
<footer class="bottom">${options.footer ?? "Signed-in area. Sessions expire after seven days."}</footer>
</body>
</html>`;
}

function loginPage(error = "", status = 200): Response {
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in | KI Movers admin</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 24px;
    background: radial-gradient(ellipse at 18% 0%, #163f69 0%, #0a1b29 45%, #071521 100%);
    font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color: #e8f0f7; }
  .login { width: min(400px, 100%); background: #0e2233; border: 1px solid #21384c; border-radius: 14px; padding: 30px;
    box-shadow: 0 30px 70px #0006; }
  .login img { width: 34px; height: 48px; object-fit: contain; }
  h1 { font-size: 21px; margin: 16px 0 4px; letter-spacing: -.02em; }
  p.sub { margin: 0 0 22px; color: #9fb3c4; font-size: 13px; }
  label { display: block; font-size: 12px; font-weight: 600; color: #c2d3e0; margin: 0 0 6px; letter-spacing: .02em; }
  input { width: 100%; padding: 11px 12px; border-radius: 8px; border: 1px solid #2b455a; background: #0a1b29;
    color: #eaf2f8; font: inherit; margin-bottom: 15px; }
  input:focus { outline: 2px solid #42c6dc; outline-offset: 1px; border-color: #42c6dc; }
  button { width: 100%; padding: 12px; border: 0; border-radius: 8px; background: #42c6dc; color: #062231;
    font: 700 14px inherit; cursor: pointer; }
  button:hover { background: #63d7e8; }
  .error { margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; background: #4a1f26; color: #ffd8d3; font-size: 13px; }
  .back { display: block; margin-top: 18px; text-align: center; color: #8fb0c4; font-size: 12px; }
  .back:hover { color: #fff; }
</style>
</head>
<body>
<form class="login" method="post" action="/admin/login" autocomplete="on">
  <img src="/assets/logo-mark.png" alt="">
  <h1>Sign in to the admin panel</h1>
  <p class="sub">Enquiries and notification settings.</p>
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
  <label for="username">Username</label>
  <input id="username" name="username" autocomplete="username" required autocapitalize="none" spellcheck="false">
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Sign in</button>
  <a class="back" href="/">← Back to the website</a>
</form>
</body>
</html>`;
  return html(body, status);
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

function dashboardPage(rows: readonly SubmissionRow[], total: number): Response {
  const table =
    rows.length > 0
      ? `<table>
      <thead><tr><th>Received</th><th>Type</th><th>Person</th><th>Move</th><th>Notes</th><th>Raw</th></tr></thead>
      <tbody>
    ${rows.map(renderRow).join("\n    ")}
      </tbody>
    </table>`
      : '<p class="empty">No enquiries yet.</p>';

  return html(
    layout({
      title: "Enquiries",
      active: "enquiries",
      body: `<h2>Enquiries</h2>
  <p class="lede">${total} total · showing the latest ${rows.length}. Email and WhatsApp alerts are configured in <a href="/admin/settings">Settings</a>.</p>
  ${table}`,
      footer: `Quote and contact form submissions, newest first. Limit ${PAGE_LIMIT}.`
    })
  );
}

function noticeMarkup(notice: Notice | null): string {
  if (!notice) return "";
  return `<p class="notice ${notice.tone}">${escapeHtml(notice.message)}</p>`;
}

type NotificationRow = {
  channel: string;
  status: string;
  detail: string;
  created_at: string;
};

function settingsPage(
  settings: Awaited<ReturnType<typeof loadSettings>>,
  notice: Notice | null,
  recent: readonly NotificationRow[]
): Response {
  const cloud = settings.whatsappProvider === "cloud";
  const log =
    recent.length > 0
      ? `<table><thead><tr><th>When</th><th>Channel</th><th>Status</th><th>Detail</th></tr></thead><tbody>${recent
          .map(
            (row) =>
              `<tr><td class="nowrap">${escapeHtml(formatTimestamp(row.created_at))}</td><td>${escapeHtml(
                row.channel
              )}</td><td><span class="tag ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td><td class="note">${escapeHtml(
                row.detail
              )}</td></tr>`
          )
          .join("")}</tbody></table>`
      : '<p class="empty">No notification attempts yet.</p>';

  return html(
    layout({
      title: "Settings",
      active: "settings",
      body: `<h2>Notification settings</h2>
  <p class="lede">Every new quote or contact request is saved here and, when enabled, sent to you by email and WhatsApp.</p>
  ${noticeMarkup(notice)}
  <form method="post" action="/admin/settings">
    <div class="grid">
      <section class="card">
        <h3>Email alerts (Resend)</h3>
        <p class="hint">Create an API key at resend.com and verify the domain you send from.</p>
        <label class="check"><input type="checkbox" name="email_enabled" value="1"${settings.emailEnabled ? " checked" : ""}> Send an email for each new enquiry</label>
        <div class="field"><label for="resend_api_key">Resend API key</label>
          <input id="resend_api_key" name="resend_api_key" type="password" value="${escapeHtml(settings.resendApiKey)}" placeholder="re_..." autocomplete="off" spellcheck="false"></div>
        <div class="field"><label for="resend_from">From address</label>
          <input id="resend_from" name="resend_from" type="text" value="${escapeHtml(settings.resendFrom)}" placeholder="KI Movers &lt;alerts@kimovers.com&gt;">
          <small>Must be an address on a domain verified in Resend.</small></div>
        <div class="field"><label for="email_to">Send notifications to</label>
          <input id="email_to" name="email_to" type="text" value="${escapeHtml(settings.emailTo)}" placeholder="you@example.com"></div>
        <div class="row">
          <button class="secondary" type="submit" formaction="/admin/settings/test" name="channel" value="email">Send test email</button>
        </div>
      </section>

      <section class="card">
        <h3>WhatsApp alerts</h3>
        <p class="hint">WhatsApp Cloud API is official but needs a Meta Business account and an approved message template. CallMeBot is a two-minute opt-in alternative for personal alerts.</p>
        <label class="check"><input type="checkbox" name="whatsapp_enabled" value="1"${settings.whatsappEnabled ? " checked" : ""}> Send a WhatsApp message for each new enquiry</label>
        <div class="field"><label for="whatsapp_provider">Provider</label>
          <select id="whatsapp_provider" name="whatsapp_provider">
            <option value="cloud"${cloud ? " selected" : ""}>WhatsApp Cloud API (Meta)</option>
            <option value="callmebot"${cloud ? "" : " selected"}>CallMeBot (personal number)</option>
          </select></div>
        <div class="field"><label for="whatsapp_phone_number_id">Phone number ID</label>
          <input id="whatsapp_phone_number_id" name="whatsapp_phone_number_id" type="text" value="${escapeHtml(settings.whatsappPhoneNumberId)}" placeholder="Cloud API only"></div>
        <div class="field"><label for="whatsapp_token">Access token</label>
          <input id="whatsapp_token" name="whatsapp_token" type="password" value="${escapeHtml(settings.whatsappToken)}" placeholder="Cloud API only" autocomplete="off" spellcheck="false"></div>
        <div class="field"><label for="whatsapp_to">Send to (WhatsApp number)</label>
          <input id="whatsapp_to" name="whatsapp_to" type="text" value="${escapeHtml(settings.whatsappTo)}" placeholder="971557930734"></div>
        <div class="field"><label for="whatsapp_template">Template name</label>
          <input id="whatsapp_template" name="whatsapp_template" type="text" value="${escapeHtml(settings.whatsappTemplate)}" placeholder="new_enquiry">
          <small>Leave empty only if the recipient messaged you in the last 24 hours.</small></div>
        <div class="field"><label for="whatsapp_template_lang">Template language</label>
          <input id="whatsapp_template_lang" name="whatsapp_template_lang" type="text" value="${escapeHtml(settings.whatsappTemplateLang)}" placeholder="en"></div>
        <div class="field"><label for="callmebot_phone">CallMeBot phone</label>
          <input id="callmebot_phone" name="callmebot_phone" type="text" value="${escapeHtml(settings.callmebotPhone)}" placeholder="+971557930734"></div>
        <div class="field"><label for="callmebot_api_key">CallMeBot API key</label>
          <input id="callmebot_api_key" name="callmebot_api_key" type="password" value="${escapeHtml(settings.callmebotApiKey)}" placeholder="Optional" autocomplete="off" spellcheck="false"></div>
        <div class="row">
          <button class="secondary" type="submit" formaction="/admin/settings/test" name="channel" value="whatsapp">Send test WhatsApp</button>
        </div>
      </section>
    </div>
    <p class="row" style="margin:20px 0 0"><button class="primary" type="submit">Save settings</button></p>
  </form>

  <h2 style="margin:34px 0 6px">Recent notifications</h2>
  <p class="lede">The last ten delivery attempts, including errors returned by Resend or WhatsApp.</p>
  ${log}`,
      footer: "Keys are stored in this Worker's D1 database and only shown inside this signed-in page."
    })
  );
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

async function loadRecentNotifications(env: Env): Promise<NotificationRow[]> {
  try {
    const result = await env.DB.prepare(
      "SELECT channel, status, detail, created_at FROM notification_log ORDER BY created_at DESC LIMIT 10"
    ).all<NotificationRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (!isSameOrigin(request)) return loginPage("Your session expired. Try again.", 403);

  let form: URLSearchParams;
  try {
    form = await readForm(request);
  } catch {
    return loginPage("That sign-in attempt could not be read.", 400);
  }

  const username = form.get("username")?.trim() ?? "";
  const password = form.get("password") ?? "";

  const expectedUsername = env.ADMIN_USERNAME?.trim();
  const expectedPassword = env.ADMIN_PASSWORD;

  const usernameMatches = expectedUsername ? await secureEquals(username, expectedUsername) : false;
  const passwordMatches = expectedPassword ? await secureEquals(password, expectedPassword) : false;

  if (!usernameMatches || !passwordMatches) {
    // A small delay blunts scripted guessing without a separate rate-limit store.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return loginPage("That username or password is not correct.", 401);
  }

  const session = await createSession(env, request);
  return redirect("/admin", session.cookie);
}

async function handleSettingsSave(request: Request, env: Env): Promise<Response> {
  let form: URLSearchParams;
  try {
    form = await readForm(request);
  } catch {
    return settingsPage(await loadSettings(env), { tone: "error", message: "That form could not be read." }, await loadRecentNotifications(env));
  }

  const provider = form.get("whatsapp_provider") === "callmebot" ? "callmebot" : "cloud";
  const value = (key: string): string => (form.get(key) ?? "").trim();

  await saveSettings(env, {
    email_enabled: form.get("email_enabled") === "1" ? "1" : "0",
    resend_api_key: value("resend_api_key"),
    resend_from: value("resend_from"),
    email_to: value("email_to"),
    whatsapp_enabled: form.get("whatsapp_enabled") === "1" ? "1" : "0",
    whatsapp_provider: provider,
    whatsapp_phone_number_id: value("whatsapp_phone_number_id"),
    whatsapp_token: value("whatsapp_token"),
    whatsapp_to: value("whatsapp_to"),
    whatsapp_template: value("whatsapp_template"),
    whatsapp_template_lang: value("whatsapp_template_lang") || "en",
    callmebot_phone: value("callmebot_phone"),
    callmebot_api_key: value("callmebot_api_key")
  });

  return settingsPage(
    await loadSettings(env),
    { tone: "ok", message: "Settings saved." },
    await loadRecentNotifications(env)
  );
}

async function handleSettingsTest(request: Request, env: Env): Promise<Response> {
  let form: URLSearchParams;
  try {
    form = await readForm(request);
  } catch {
    return settingsPage(await loadSettings(env), { tone: "error", message: "That request could not be read." }, await loadRecentNotifications(env));
  }

  const channel: Channel = form.get("channel") === "whatsapp" ? "whatsapp" : "email";
  const origin = new URL(request.url).origin;
  const result = await sendTestNotification(env, channel, origin);

  const message =
    result.status === "sent"
      ? `Test ${channel} sent. ${result.detail}`
      : `Test ${channel} ${result.status}: ${result.detail}`;

  return settingsPage(
    await loadSettings(env),
    { tone: result.status === "sent" ? "ok" : "error", message },
    await loadRecentNotifications(env)
  );
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/admin";
  const method = request.method;

  const username = env.ADMIN_USERNAME?.trim();
  const password = env.ADMIN_PASSWORD;
  if (!username || !password) {
    return textResponse(
      "Admin access is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD with `npx wrangler secret put`, or in .dev.vars for local development.",
      503
    );
  }

  if (path === "/admin/login" && method === "POST") return handleLogin(request, env);
  if (path === "/admin/login" && method === "GET") return redirect("/admin");

  if (path === "/admin/logout" && method === "POST") {
    const cookie = await destroySession(request, env);
    return redirect("/admin", cookie);
  }

  const authed = await hasSession(request, env);
  if (!authed) {
    if (method === "GET" || method === "HEAD") return loginPage();
    return loginPage("Please sign in first.", 401);
  }

  if (path === "/admin" || path === "/admin/index") {
    if (method === "POST") return textResponse("Method not allowed.", 405, { allow: "GET, HEAD" });
    if (method === "HEAD") return new Response(null, { status: 200, headers: pageHeaders() });
    try {
      const submissions = await loadSubmissions(env);
      return dashboardPage(submissions.rows, submissions.total);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "admin_query_failed",
          error: error instanceof Error ? error.message : String(error)
        })
      );
      return textResponse("Could not load submissions.", 500);
    }
  }

  if (path === "/admin/settings") {
    if (method === "GET" || method === "HEAD") {
      const page = settingsPage(await loadSettings(env), null, await loadRecentNotifications(env));
      if (method === "HEAD") return new Response(null, { status: 200, headers: pageHeaders() });
      return page;
    }
    if (method === "POST") {
      if (!isSameOrigin(request)) return textResponse("Cross-site request blocked.", 403);
      return handleSettingsSave(request, env);
    }
    return textResponse("Method not allowed.", 405, { allow: "GET, HEAD, POST" });
  }

  if (path === "/admin/settings/test" && method === "POST") {
    if (!isSameOrigin(request)) return textResponse("Cross-site request blocked.", 403);
    return handleSettingsTest(request, env);
  }

  return textResponse("Not found.", 404);
}
