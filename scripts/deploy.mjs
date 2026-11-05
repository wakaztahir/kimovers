import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const dryRun = process.argv.includes("--dry-run");
const configPath = "wrangler.jsonc";
const databaseName = "ki-movers-submissions";
const cliSiteUrl = process.argv.find((arg) => arg.startsWith("--site-url="))?.split("=")[1];

const log = (message) => console.log(`\n▸ ${message}`);
const fail = (message) => {
  console.error(`\n✗ ${message}`);
  process.exit(1);
};

const npx = (args, options = {}) =>
  spawnSync("npx", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, CI: "1" },
    ...options
  });

const run = (args, options = {}) => {
  const result = npx(args, { stdio: "inherit", ...options });
  if (result.status !== 0) fail(`\`npx ${args.join(" ")}\` failed.`);
  return result;
};

const capture = (args) => npx(args, { stdio: ["ignore", "pipe", "pipe"] });

const npmRun = (script, options = {}) => {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });
  if (result.status !== 0) fail(`\`npm run ${script}\` failed.`);
};

// --- site URL ---------------------------------------------------------------
// Hard-coded to the production domain; SITE_URL / --site-url=… can override it
// for previews or a domain move.
const defaultSiteUrl = "https://kimovers.com";
const siteUrl = (cliSiteUrl || process.env.SITE_URL || defaultSiteUrl).trim().replace(/\/+$/, "");
if (!/^https?:\/\/[^/]+/.test(siteUrl)) fail(`The site URL must be an absolute origin (https://…), received "${siteUrl}".`);

console.log(`Deploying KI Movers${dryRun ? " (dry run)" : ""} with canonical origin ${siteUrl}`);

if (!dryRun) {
  // --- auth ---------------------------------------------------------------
  log("Checking Wrangler authentication");
  const whoami = capture(["wrangler", "whoami"]);
  const whoamiText = `${whoami.stdout ?? ""}${whoami.stderr ?? ""}`;
  if (whoami.status !== 0 || /not authenticated|not logged in|Please run.*wrangler login/i.test(whoamiText)) {
    fail(`Not signed in to Cloudflare. Run \`npx wrangler login\` first, then rerun this command.\n${whoamiText.trim()}`);
  }

  // --- D1 database --------------------------------------------------------
  log("Checking the D1 database");
  let config = readFileSync(configPath, "utf8");
  const currentId = config.match(/"database_id":\s*"([^"]*)"/)?.[1] ?? "";
  const isPlaceholder = !currentId || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(currentId);

  if (isPlaceholder) {
    const created = capture(["wrangler", "d1", "create", databaseName]);
    const createOutput = `${created.stdout ?? ""}${created.stderr ?? ""}`.trim();
    let databaseId = createOutput.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];

    if (!databaseId) {
      // The database may already exist but not be wired into wrangler.jsonc.
      const list = capture(["wrangler", "d1", "list", "--json"]).stdout ?? "";
      try {
        const databases = JSON.parse(list.slice(list.indexOf("[")));
        databaseId = databases.find((database) => database.name === databaseName)?.uuid;
      } catch {
        databaseId = undefined;
      }
    }

    if (!databaseId) {
      fail(`Could not create or find the D1 database "${databaseName}".\n${createOutput}`);
    }
    config = config.replace(/"database_id":\s*"[^"]*"/, `"database_id": "${databaseId}"`);
    writeFileSync(configPath, config);
    console.log(`  Saved database_id ${databaseId} to ${configPath}`);
  } else {
    console.log(`  Reusing database_id ${currentId}`);
  }

  log("Applying remote D1 migrations");
  run(["wrangler", "d1", "migrations", "apply", databaseName, "--remote"]);

  // --- admin secrets ------------------------------------------------------
  log("Checking admin credentials");
  const secretList = capture(["wrangler", "secret", "list", "--format", "json"]);
  let existingSecrets = [];
  try {
    existingSecrets = (JSON.parse(secretList.stdout ?? "[]") ?? []).map((secret) => secret.name);
  } catch {
    existingSecrets = [...(secretList.stdout ?? "").matchAll(/"name":\s*"([^"]+)"/g)].map((found) => found[1]);
  }

  const generatedPassword = process.env.ADMIN_PASSWORD ? null : randomBytes(15).toString("base64url");
  const secrets = [
    ["ADMIN_USERNAME", process.env.ADMIN_USERNAME || "admin"],
    ["ADMIN_PASSWORD", process.env.ADMIN_PASSWORD || generatedPassword]
  ];

  for (const [name, value] of secrets) {
    if (existingSecrets.includes(name)) {
      console.log(`  ${name} is already set`);
      continue;
    }
    const result = npx(["wrangler", "secret", "put", name], { input: `${value}\n`, stdio: ["pipe", "inherit", "inherit"] });
    if (result.status !== 0) fail(`Could not set the ${name} secret.`);
    console.log(`  ${name} set`);
  }
  if (generatedPassword && !existingSecrets.includes("ADMIN_PASSWORD")) {
    console.log(`\n  Admin login: admin / ${generatedPassword}`);
    console.log("  Store this password now — it will not be shown again. Change it with `npx wrangler secret put ADMIN_PASSWORD`.");
  }
}

// --- build, validate, deploy ------------------------------------------------
log("Building the site");
npmRun("build", { env: { ...process.env, SITE_URL: siteUrl } });

log("Running the SEO check");
npmRun("seo:check", { env: { ...process.env, SITE_URL: siteUrl } });

if (dryRun) {
  log("Building the Worker bundle without uploading");
  run(["wrangler", "deploy", "--dry-run", "--outdir", ".wrangler/dry-run"]);
  console.log("\n✓ Dry run passed. Run `npm run deploy` to publish for real.");
  process.exit(0);
}

log("Deploying to Cloudflare Workers");
run(["wrangler", "deploy"]);

console.log(`\n✓ Deployed. Canonical origin: ${siteUrl}`);
console.log(`  Open ${siteUrl}/ and ${siteUrl}/admin to confirm the site and admin page.`);
