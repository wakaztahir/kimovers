-- Quote and contact enquiries submitted through the website forms.
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('quote', 'contact')),
  submitted_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  property_size TEXT NOT NULL DEFAULT '',
  moving_from TEXT NOT NULL DEFAULT '',
  moving_to TEXT NOT NULL DEFAULT '',
  moving_date TEXT NOT NULL DEFAULT '',
  extras TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  comments TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_kind ON submissions (kind);
