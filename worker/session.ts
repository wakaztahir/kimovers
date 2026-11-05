// Cookie sessions for the admin panel. The cookie holds a random token; only a
// SHA-256 hash of it is stored, so a database leak cannot be replayed.

const COOKIE_NAME = "ki_admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export async function createSession(env: Env, request: Request): Promise<{ cookie: string; expiresAt: string }> {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?")
    .bind(new Date(now).toISOString())
    .run();
  await env.DB.prepare("INSERT INTO admin_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)")
    .bind(await hashToken(token), new Date(now).toISOString(), expiresAt)
    .run();

  const secure = isSecureRequest(request) ? "; Secure" : "";
  const cookie = `${COOKIE_NAME}=${token}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
  return { cookie, expiresAt };
}

export async function hasSession(request: Request, env: Env): Promise<boolean> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  try {
    const row = await env.DB.prepare(
      "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?"
    )
      .bind(await hashToken(token), new Date().toISOString())
      .first<{ token_hash: string }>();
    return Boolean(row);
  } catch (error) {
    console.error(
      JSON.stringify({ message: "session_read_failed", error: error instanceof Error ? error.message : String(error) })
    );
    return false;
  }
}

export async function destroySession(request: Request, env: Env): Promise<string> {
  const token = readCookie(request, COOKIE_NAME);
  if (token) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(await hashToken(token))
      .run()
      .catch(() => undefined);
  }
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

/**
 * Extra signal only: browsers are inconsistent about sending Origin (Safari and
 * privacy tools often omit it), so a missing header is not treated as hostile.
 * The CSRF token below is what actually protects the forms.
 */
export function hasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

const CSRF_COOKIE = "ki_csrf";
const CSRF_TTL_SECONDS = 24 * 60 * 60;

export function readCsrfToken(request: Request): string | null {
  const token = readCookie(request, CSRF_COOKIE);
  return token && token.length >= 20 ? token : null;
}

export function createCsrfToken(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(24)));
}

/** Pairs a form token with the browser cookie (double-submit). */
export function csrfCookie(request: Request, token: string): string {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${CSRF_COOKIE}=${token}; Path=/admin; SameSite=Strict; Max-Age=${CSRF_TTL_SECONDS}${secure}; HttpOnly`;
}

export async function verifyCsrf(request: Request, submitted: string | null): Promise<boolean> {
  const stored = readCsrfToken(request);
  if (!stored || !submitted) return false;
  return secureStringEquals(stored, submitted);
}

async function secureStringEquals(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right))
  ]);
  const a = new Uint8Array(leftDigest);
  const b = new Uint8Array(rightDigest);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return difference === 0;
}
