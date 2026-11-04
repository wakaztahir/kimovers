import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

const outdir = "dist";
const staticEntries = ["index.html", "styles.css", "robots.txt", "sitemap.xml", "_headers"];

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

await build({
  entryPoints: ["src/app.ts"],
  outfile: `${outdir}/app.js`,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  logLevel: "info"
});

await Promise.all([
  ...staticEntries.map((entry) => cp(entry, `${outdir}/${entry}`)),
  cp("assets", `${outdir}/assets`, { recursive: true })
]);

console.log(`Built static site into ./${outdir}`);
