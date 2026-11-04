// Secrets are set with `wrangler secret put` (or in .dev.vars locally) and are
// not part of the generated bindings, so they are declared here. They are
// optional because the admin page reports a clear error when they are missing.
interface Env {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}
