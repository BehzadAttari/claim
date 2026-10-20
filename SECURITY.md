# Security Policy

## Reporting a vulnerability

Email **security@got-a.page** (or abuse@got-a.page if the first address isn't
set up yet). Please include what you found, how to reproduce it, and what an
attacker could do with it. We aim to acknowledge reports within 72 hours.

Please don't open public issues for security problems.

## What matters most here

- **DNS integrity**: the sync only touches records it created (tagged with a
  managed comment) and its API token is scoped to DNS editing on this zone
  alone.
- **Abuse vectors**: phishing or impersonation pages. Report them - see
  [ABUSE.md](ABUSE.md).
- **Secrets**: none live in this repo. Tokens and zone IDs are GitHub secrets,
  never printed in logs.

## Scope notes

Pages in *point* mode are hosted by their owners; their security is the
owner's responsibility, though we'll suspend names used for harm. *Instant*
pages render from a read-only index built from this repo, with no user input
executed and no cookies set.
