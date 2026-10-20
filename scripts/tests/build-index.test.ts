/** Availability includes all names without exposing point claims to the renderer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("index separates instant rendering from claimed and reserved names", () => {
  const repo = mkdtempSync(join(tmpdir(), "page-index-"));
  try {
    for (const path of ["schema", "config.json", "reserved.json"]) cpSync(path, join(repo, path), { recursive: true });
    mkdirSync(join(repo, "pages"));
    const claims = {
      "point-example": { mode: "point", owner: { github: "octocat" }, records: { CNAME: "octocat.github.io" } },
      "instant-example": { mode: "instant", owner: { github: "octocat" }, page: { type: "person", title: "Octo Cat" } },
    };
    for (const [name, claim] of Object.entries(claims)) writeFileSync(join(repo, "pages", name + ".json"), JSON.stringify(claim));
    execFileSync(process.execPath, ["--import", "tsx", "scripts/src/build-index.ts", "--repo", repo]);
    const index = JSON.parse(readFileSync(join(repo, "dist/index.json"), "utf8"));
    const stats = JSON.parse(readFileSync(join(repo, "dist/stats.json"), "utf8"));
    assert.equal(index.availabilityVersion, 1);
    assert.deepEqual(index.claimed, ["instant-example", "point-example"]);
    assert.deepEqual(Object.keys(index.pages), ["instant-example"]);
    assert.equal(index.pages["point-example"], undefined);
    assert.equal(index.pages["instant-example"].title, "Octo Cat");
    const reserved = JSON.parse(readFileSync(join(repo, "reserved.json"), "utf8"));
    for (const names of [reserved.infrastructure, reserved.brands, reserved.blocked]) {
      for (const name of names) assert.ok(index.reserved.includes(name), name);
    }
    assert.equal(index.reserved.length, new Set(index.reserved).size);
    assert.equal(stats.totalPages, 2);
    assert.equal(stats.instantPages, 1);
    assert.equal(stats.pointPages, 1);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
