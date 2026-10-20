/**
 * Builds the instant-mode index the renderer Worker and the website read.
 *
 * Output (dist/):
 *   index.json  - instant pages plus separate claimed/reserved name lists
 *   stats.json  - counts for the website's live counter
 *
 * The workflow publishes dist/ to GitHub Pages, so both consumers fetch a
 * static file. Nothing calls the GitHub API at request time.
 *
 * Usage: tsx scripts/src/build-index.ts --repo . --out dist
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadRepo } from "./lib/store.js";
import { schemaErrors } from "./lib/schema.js";
import { checkClaim } from "./lib/claims.js";

function arg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const repo = arg("--repo", ".");
const outDir = arg("--out", join(repo, "dist"));
const data = loadRepo(repo);

// Never publish a broken index: re-validate every claim first.
const problems: string[] = [];
const index: Record<string, unknown> = {};
const stats = {
  generatedAt: new Date().toISOString(),
  totalPages: 0,
  instantPages: 0,
  pointPages: 0,
  byType: {} as Record<string, number>,
  showcase: [] as string[],
};

for (const { name, claim } of data.pages) {
  const errs = [...schemaErrors(data.schema, claim), ...checkClaim(name, claim, data.limits).errors];
  if (errs.length > 0) {
    problems.push(`${name}: ${errs.join("; ")}`);
    continue;
  }
  stats.totalPages += 1;
  if (claim.mode === "instant" && claim.page) {
    stats.instantPages += 1;
    stats.byType[claim.page.type] = (stats.byType[claim.page.type] ?? 0) + 1;
    index[name] = {
      type: claim.page.type,
      title: claim.page.title,
      tagline: claim.page.tagline ?? null,
      avatar: claim.page.avatar ?? null,
      theme: claim.page.theme ?? "sunrise",
      links: claim.page.links ?? [],
      sections: claim.page.sections ?? [],
      product: claim.page.product ?? null,
      owner: claim.owner.github,
      purpose: claim.purpose ?? null,
      showcase: claim.showcase === true,
    };
    if (claim.showcase === true) stats.showcase.push(name);
  } else {
    stats.pointPages += 1;
  }
}

if (problems.length > 0) {
  console.error("Refusing to build an index from invalid pages:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({
    generatedAt: stats.generatedAt,
    pages: index, // Renderer contract: instant pages only.
    availabilityVersion: 1,
    claimed: data.pages.map(({ name }) => name).sort(),
    reserved: [...new Set([
      ...data.reserved.infrastructure, ...data.reserved.brands, ...data.reserved.blocked,
    ])].sort(),
  }, null, 2)
);
writeFileSync(join(outDir, "stats.json"), JSON.stringify(stats, null, 2));
console.log(`Built index: ${Object.keys(index).length} instant pages, ${stats.pointPages} point pages.`);
