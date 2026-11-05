-- Runtime configuration edited in the admin panel (Resend, WhatsApp).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

-- Signed-in admin browsers. Only a hash of the cookie token is stored.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions (expires_at);

-- Delivery attempts for new enquiries, shown in the admin settings page.
CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'skipped', 'failed')),
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log (created_at DESC);
