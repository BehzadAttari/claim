# got-a.page

**Everyone's got a page.** Claim yours - free, forever, no hosting required.

`yourname.got-a.page` is a free subdomain you claim with one small JSON file and
one pull request. Use it for your profile, your product launch, your side
project, your club, your event. If you already have a website, point your name
at it. If you don't, we'll build a lovely page for you on the spot.

## Claim yours in about a minute

1. **Fork this repository** (button, top right).
2. **Add one file**: `pages/yourname.json` - copy a starter below.
3. **Open a pull request.** Our friendly checker reviews it in seconds and
   tells you exactly what your page will do.
4. A maintainer merges, and **you've got a page.** Instant pages go live
   within minutes; pointed pages go live as soon as DNS syncs.

Never made a pull request? This repo is a kind place for your first one - the
[step-by-step guide](CONTRIBUTING.md) walks you through every click.

## Two ways to get a page

### Instant - you have no website (we host it for you)

```json
{
  "mode": "instant",
  "owner": { "github": "yourusername" },
  "page": {
    "type": "person",
    "title": "Your Name",
    "tagline": "What you're about, in one line",
    "avatar": "https://github.com/yourusername.png",
    "theme": "sunrise",
    "links": [{ "label": "GitHub", "url": "https://github.com/yourusername" }],
    "sections": [{ "heading": "About", "text": "A few sentences about you." }]
  }
}
```

Pick a theme (`sunrise`, `lagoon`, `forest`, `plum`, `slate`, `ember`), add your
links, done. We render a fast, accessible page at `yourname.got-a.page` -
light and dark mode included.

### Point - you already host a site somewhere

```json
{
  "mode": "point",
  "owner": { "github": "yourusername" },
  "purpose": "My portfolio",
  "records": { "CNAME": "yourusername.github.io" }
}
```

Works with GitHub Pages, Vercel, Netlify, Cloudflare Pages - anywhere that
gives you a hostname or IP. `CNAME`, `A`, `AAAA` and `TXT` records supported.

## A few kind rules

- Names are 2-40 characters, lowercase letters, numbers and hyphens.
- One GitHub account, up to **2 pages** while we're young.
- Your page is public. Everything in this repo is public.
- Be good: no phishing, scams, malware, impersonation, illegal or adult
  content. See [TERMS.md](TERMS.md) and [ABUSE.md](ABUSE.md).
- Some names are [reserved](reserved.json) (brands, service addresses, and
  words that would make this place less welcoming).

## What's where

| Path | What it does |
| --- | --- |
| `pages/` | One JSON file per claimed page |
| `schema/` | The shape every file is checked against |
| `scripts/` | Validation, index build and DNS sync (TypeScript) |
| `reserved.json` | Names nobody can claim |
| `config.json` | Limits (pages per account, DNS record budget, flags) |

## The plumbing (for the curious)

Instant pages all ride **one wildcard DNS record** into a small Cloudflare
Worker that renders them, so a thousand pages cost one DNS entry. Pointed
pages get their own records, synced from this repo by a diff-based job that
only ever touches records it created. The DNS layer is provider-agnostic, so
moving providers later is an adapter, not a rewrite.

## License

MIT - see [LICENSE](LICENSE).
