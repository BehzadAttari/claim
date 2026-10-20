/**
 * Syncs point-mode DNS records with the provider, diff-based and idempotent.
 *
 *   tsx scripts/src/dns-sync.ts --repo .            dry run (default, prints the plan)
 *   tsx scripts/src/dns-sync.ts --repo . --apply    make the changes
 *
 * Safety rails:
 *   - only records tagged MANAGED_TAG are ever updated or deleted
 *   - records present in DNS but not in the repo are left alone unless tagged
 *   - the run refuses to apply a plan that would exceed the record budget
 */

import { loadRepo } from "./lib/store.js";
import { budgetProblems, recordCount } from "./lib/claims.js";
import type { DnsProvider, DnsRecord, RecordType } from "./dns/provider.js";
import { CloudflareProvider } from "./dns/cloudflare.js";

const ZONE = "got-a.page";
const TTL = 300;

function arg(flag: string, fallback = ""): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const apply = process.argv.includes("--apply");
const repo = arg("--repo", ".");

/** The exact record set the repo asks for, one row per DNS record. */
function desiredRecords(): Omit<DnsRecord, "id">[] {
  const data = loadRepo(repo);
  const pointPages = data.pages.filter((p) => p.claim.mode === "point");
  const over = budgetProblems(data.pages, data.limits);
  if (over.length > 0) {
    console.error(over.join("\n"));
    process.exit(1);
  }
  const desired: Omit<DnsRecord, "id">[] = [];
  for (const { name, claim } of pointPages) {
    const fqdn = `${name}.${ZONE}`;
    const r = claim.records!;
    if (r.CNAME) desired.push({ name: fqdn, type: "CNAME", content: r.CNAME, ttl: TTL, managed: true });
    for (const ip of r.A ?? []) desired.push({ name: fqdn, type: "A", content: ip, ttl: TTL, managed: true });
    for (const ip of r.AAAA ?? []) desired.push({ name: fqdn, type: "AAAA", content: ip, ttl: TTL, managed: true });
    for (const txt of r.TXT ?? []) desired.push({ name: fqdn, type: "TXT", content: txt, ttl: TTL, managed: true });
  }
  return desired;
}

interface Plan {
  create: Omit<DnsRecord, "id">[];
  update: DnsRecord[];
  remove: DnsRecord[];
}

function diff(desired: Omit<DnsRecord, "id">[], live: DnsRecord[]): Plan {
  const key = (r: { name: string; type: string }) => `${r.name}|${r.type}`;
  const liveByKey = new Map<string, DnsRecord[]>();
  for (const r of live) {
    const list = liveByKey.get(key(r)) ?? [];
    list.push(r);
    liveByKey.set(key(r), list);
  }

  const plan: Plan = { create: [], update: [], remove: [] };
  const matched = new Set<string>();

  for (const want of desired) {
    const candidates = (liveByKey.get(key(want)) ?? []).filter((r) => !matched.has(r.id));
    const exact = candidates.find((r) => r.content === want.content && r.managed);
    if (exact) {
      matched.add(exact.id);
      continue;
    }
    const reusable = candidates.find((r) => r.managed);
    if (reusable) {
      matched.add(reusable.id);
      plan.update.push({ ...reusable, content: want.content, ttl: want.ttl });
    } else {
      plan.create.push(want);
    }
  }

  // Anything managed that the repo no longer asks for gets removed.
  // Untagged records are someone else's - hands off.
  for (const r of live) {
    if (r.managed && !matched.has(r.id)) plan.remove.push(r);
  }
  return plan;
}

const providerName = arg("--provider", "cloudflare");
let provider: DnsProvider;
if (providerName === "cloudflare") {
  provider = new CloudflareProvider(process.env.CF_API_TOKEN ?? "", process.env.CF_ZONE_ID ?? "");
} else {
  console.error(`Unknown provider "${providerName}". Only cloudflare exists today; the interface is ready for more.`);
  process.exit(1);
}

const desired = desiredRecords();
const live = await provider.listRecords(ZONE);
const plan = diff(desired, live);

console.log(`${apply ? "Applying" : "Dry run - would apply"} on ${provider.name}:`);
for (const r of plan.create) console.log(`  + ${r.type} ${r.name} -> ${r.content}`);
for (const r of plan.update) console.log(`  ~ ${r.type} ${r.name} -> ${r.content}`);
for (const r of plan.remove) console.log(`  - ${r.type} ${r.name} (was ${r.content})`);
if (plan.create.length + plan.update.length + plan.remove.length === 0) {
  console.log("  nothing to do, DNS already matches the repo.");
}

if (apply) {
  for (const r of plan.create) await provider.createRecord(r);
  for (const r of plan.update) await provider.updateRecord(r);
  for (const r of plan.remove) await provider.deleteRecord(r);
  console.log("Done.");
} else {
  console.log("Re-run with --apply to make these changes.");
}
