# Setup guide (maintainers)

Everything you click once, by hand, to take got-a.page from fresh repos to a
live service. About 15 minutes, all free tiers.

## 1. DNS records (Cloudflare dashboard - got-a.page zone - DNS - Records)

| Type | Name | Content | Proxy | Why |
| --- | --- | --- | --- | --- |
| CNAME | `@` | `got-a-page.github.io` | DNS only (for now) | GitHub Pages (website). A CNAME at the apex works because Cloudflare flattens it at the root. |
| CNAME | `www` | `got-a-page.github.io` | DNS only (for now) | www redirect |
| AAAA | `*` | `100::` | **Proxied** | Wildcard - sends every unlisted subdomain to the Worker |

Keep `@` and `www` on **DNS only** (grey cloud) until the website repo's
**Settings - Pages** shows the DNS check green and the HTTPS certificate as
issued - proxied records can stall GitHub's certificate check. Once
**Enforce HTTPS** ticks on, you may switch both records to proxied (orange
cloud); when you do, set the SSL/TLS mode to **Full (strict)**
(**SSL/TLS - Overview**) so Cloudflare keeps validating GitHub's
certificate. Never pick "Flexible" - that shows visitors HTTPS while
fetching from GitHub over plain HTTP.

That last record is the whole trick: **one** wildcard record serves every
instant page, no matter how many people claim one. Point-mode pages each add
their own record(s) via the sync workflow, and explicit records always win
over the wildcard in DNS.

Why `100::`? It's a discard address - the record only exists so Cloudflare
accepts the wildcard, and the Worker route below intercepts requests before
any origin is contacted. Keep it **proxied** (orange cloud) or the Worker
never runs.

## 2. The renderer Worker

1. Cloudflare dashboard - Workers & Pages - **Create Worker** - name it
   `got-a-page-renderer` - deploy the hello-world for now.
2. In the worker: **Settings - Triggers - Routes - Add route**:
   `*.got-a.page/*` - zone `got-a.page`.
3. Deploy the real code from the `renderer` repo: `npm ci && npx wrangler deploy`
   (Wrangler will ask you to log in the first time).

## 3. Scoped API token for DNS sync

1. Cloudflare dashboard - profile icon - **My Profile - API Tokens - Create
   Token**.
2. Start blank (or use the "Edit zone DNS" template) with exactly:
   - Permissions: **Zone - DNS - Edit**
   - Zone Resources: **Include - Specific zone - got-a.page**
3. Copy the token, then find the zone ID on the zone's **Overview** page
   (right-hand column).
4. In the `claim` repo: **Settings - Secrets and variables - Actions - New
   repository secret** - add:
   - `CF_API_TOKEN` - the token
   - `CF_ZONE_ID` - the zone ID
5. Test without changing anything: **Actions - Sync DNS records - Run
   workflow** (manual runs are always dry-runs; merges apply).

## 4. GitHub Pages

- `website` repo: **Settings - Pages** - source **Deploy from a branch** -
  `main` / root. Add custom domain `got-a.page` (the `CNAME` file in the repo
  already matches). Wait for the DNS check to go green and the certificate
  to issue (usually a few minutes; keep the DNS records unproxied until
  then - see step 1), then tick **Enforce HTTPS**.
- `claim` repo: the **Publish the page index** workflow manages Pages
  itself (source: GitHub Actions). Run it once from the Actions tab, then
  the index lives at `https://got-a-page.github.io/claim/index.json`.

## 5. Branch protection (`claim` repo)

**Settings - Branches - Add rule** for `main`:

- Require a pull request before merging
- Require approvals: **1** (CODEOWNERS makes that a maintainer)
- Require status checks: **Check page claims**
- (Recommended) Require conversation resolution before merging

## 6. Email Routing (abuse@ and security@)

Cloudflare dashboard - got-a.page zone - **Email - Email Routing** -
enable, then add:

| Address | Forward to |
| --- | --- |
| `abuse@got-a.page` | your inbox |
| `security@got-a.page` | your inbox |

Cloudflare adds its own MX records automatically - these don't count against
our DNS budget in any meaningful way, and MX claims stay disabled in
`config.json` regardless.

## 7. The org profile

The `.github` repo's `profile/README.md` is what visitors see at
github.com/got-a-page. It's already written - create the repo, push, done.

## Done - smoke test

1. Claim a test page through a fork (instant mode).
2. Merge, watch **Publish the page index** go green.
3. `curl https://<name>.got-a.page` renders the page.
4. `curl https://unclaimed-name.got-a.page` shows the friendly "unclaimed"
   page with a link to claim it.
