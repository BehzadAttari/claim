# Public Suffix List - submission checklist

Once got-a.page has real users, applying to the
[Public Suffix List](https://publicsuffix.org/) (PSL) makes browsers treat
each `name.got-a.page` as its own site: cookies can't leak across pages,
and certificate rate limits apply per subdomain instead of per domain.

Do this when we have steady, genuine usage - not at launch.

- [ ] Confirm the project is stable and the domain is renewed for 5+ years
- [ ] Read the PSL guidelines and format rules
- [ ] Add the `_psl.got-a.page` TXT record they request for validation
      (create it by hand in Cloudflare; the sync never touches untagged
      records, so it's safe)
- [ ] Fork the publicsuffix/list repository
- [ ] Add `got-a.page` to the PRIVATE section, alphabetically, in the exact
      required format with our contact email
- [ ] Run their test suite (`make test`) and fix any complaints
- [ ] Open the PR, answer maintainer questions promptly
- [ ] After merge, note the browser roll-out lag (weeks to months) in the
      docs and celebrate

Why we wait: the PSL is for real services with real users, and premature
submissions get declined. The reputation of the application matters.
