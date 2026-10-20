/** Reads claims from the repo (worktree or a git ref) and the shared config files. */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { ClaimedPage, Limits, PageClaim } from "./types.js";
import type { ReservedLists } from "./reserved.js";

export interface RepoData {
  pages: ClaimedPage[];
  limits: Limits;
  reserved: ReservedLists;
  schema: object;
}

export function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function pagesDir(repo: string): string {
  return join(repo, "pages");
}

function toClaimed(name: string, data: unknown): ClaimedPage {
  return { name, claim: data as PageClaim };
}

/** Every claim in a worktree checkout. */
export function loadRepo(repo: string): RepoData {
  const pages: ClaimedPage[] = [];
  const dir = pagesDir(repo);
  if (existsSync(dir)) {
    for (const file of readdirSync(dir).sort()) {
      if (!file.endsWith(".json")) continue;
      pages.push(toClaimed(file.slice(0, -5), readJsonFile(join(dir, file))));
    }
  }
  return {
    pages,
    limits: readJsonFile(join(repo, "config.json")) as Limits,
    reserved: readJsonFile(join(repo, "reserved.json")) as ReservedLists,
    schema: readJsonFile(join(repo, "schema", "page.schema.json")) as object,
  };
}

/** Claims as they exist on a git ref (used to compare a PR against main). */
export function loadPagesAtRef(repo: string, ref: string): Map<string, PageClaim> {
  const out = new Map<string, PageClaim>();
  let listing = "";
  try {
    listing = execFileSync("git", ["ls-tree", "--name-only", ref, "pages/"], {
      cwd: repo,
      encoding: "utf8",
    });
  } catch {
    return out; // ref has no pages directory yet
  }
  for (const path of listing.split("\n").filter((l) => l.endsWith(".json"))) {
    const raw = execFileSync("git", ["show", `${ref}:${path}`], { cwd: repo, encoding: "utf8" });
    out.set(path.split("/").pop()!.slice(0, -5), JSON.parse(raw) as PageClaim);
  }
  return out;
}

export interface ChangedFile {
  status: "added" | "modified" | "deleted";
  path: string;
}

/** Pages touched between the base ref and the worktree HEAD. */
export function changedPages(repo: string, baseRef: string): ChangedFile[] {
  const raw = execFileSync(
    "git",
    ["diff", "--name-status", "--diff-filter=AMD", `${baseRef}...HEAD`, "--", "pages/"],
    { cwd: repo, encoding: "utf8" }
  );
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, path] = line.split(/\s+/);
      const status = code === "A" ? "added" : code === "D" ? "deleted" : "modified";
      return { status, path } as ChangedFile;
    })
    .filter((f) => /^pages\/[^/]+\.json$/.test(f.path));
}
