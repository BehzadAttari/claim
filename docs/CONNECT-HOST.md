# Connect your hosting provider (point mode)

A merged claim creates DNS records. It does **not** add the domain to your
hosting account. Both sides must be set up before your site can load at
`yourname.got-a.page`. Instant mode needs none of these steps.

## Before your PR merges

Add `yourname.got-a.page` to the host serving your site, using the steps below.
Do this before the claim is merged and DNS is published, so the hostname is
associated with your site first. Copy the host's recommended DNS target into
your claim's `records` field. If you already opened the PR, edit the same file
on your fork's branch to update it.

You do not need access to the `got-a.page` DNS dashboard or to change its
nameservers. The claim repo publishes the supported records for you.

### GitHub Pages

1. Open **your website's repository**, not the claim repo. Go to **Settings >
   Pages > Custom domain**, enter `yourname.got-a.page`, then **Save**.
2. If you publish from a branch, GitHub adds a `CNAME` file to the root of your
   publishing source. It contains only `yourname.got-a.page`, without `https://`
   or a path. Keep it in future builds. If you use a custom GitHub Actions
   publishing workflow, the Pages setting is still required, but a `CNAME`
   file is ignored and is not required.
3. In your claim JSON, use `"records": { "CNAME": "yourusername.github.io" }`
   (or your organization's `github.io` hostname). Do not include a repository
   path or `https://`.
4. After merge and DNS sync, wait for GitHub's DNS check and certificate, then
   select **Enforce HTTPS** when available. GitHub says this can take up to
   24 hours.

[GitHub Pages instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

### Vercel

1. Open your project, then **Settings > Domains > Add Domain**. Add
   `yourname.got-a.page` to that project.
2. Copy the **CNAME target recommended for this domain** into your claim's
   `records.CNAME`. Vercel uses project-specific targets, so do not copy a
   generic target or another project's value.
3. After merge and DNS sync, check the domain's configuration and certificate
   status in Vercel. No `CNAME` file is needed in your source repository.

[Vercel instructions](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

### Netlify

1. Open your site's **Domain management**. Choose **Add domain > Add a domain
   you already own**, enter `yourname.got-a.page`, and follow **Verify > Add
   domain**. Keep external DNS; do not move the `got-a.page` nameservers.
2. Under **Production domains**, use **Pending DNS verification** to see the
   recommended target. Usually it is `your-site.netlify.app`; copy the value
   Netlify gives you into `records.CNAME`.
3. After merge and DNS sync, check DNS verification and HTTPS status in
   Netlify. No `CNAME` file is needed in your source repository.

[Netlify domain steps](https://docs.netlify.com/manage/domains/configure-domains/bring-a-domain-to-netlify)
and [external DNS instructions](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)

### Cloudflare Pages

1. Open **Workers & Pages > your Pages project > Custom domains > Set up a
   domain**. Enter `yourname.got-a.page` and continue through the setup.
2. Associate the domain with your Pages project **before** the claim's CNAME
   is published. A CNAME alone, without this dashboard setup, can return a
   `522` error.
3. Put the project's `your-site.pages.dev` target in `records.CNAME`. The
   claim repo handles DNS; you do not need to add the `got-a.page` zone to
   your account or change its nameservers.
4. After merge and DNS sync, check that the custom domain is active and HTTPS
   works. No `CNAME` file is needed in your source repository.

[Cloudflare Pages instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## After your PR merges

1. Wait for the claim repo's DNS sync, then for DNS caches to update. Merge
   does not mean DNS or your host's certificate is ready immediately.
2. Return to your host's custom-domain page. Resolve any verification warning
   and wait for its HTTPS certificate. DNS propagation and certificate
   issuance can take a while; GitHub documents up to 24 hours for Enforce HTTPS
   to become available.
3. Visit `https://yourname.got-a.page` and confirm it shows your own site with
   a valid certificate. `.page` addresses require HTTPS, so an unfinished
   certificate can prevent the site from opening.

If a host asks for an extra verification record, copy the exact record name,
type and value into an issue for maintainers to review. Do not add it at the
wrong name or combine a CNAME with TXT on the same hostname. The current claim
format does not support arbitrary verification-record names. Never post
passwords, API keys or login codes.

Before removing your custom domain or deleting your hosted site, remove the
point-mode claim's DNS through a PR too. Leaving DNS pointed at a detached
hosting account can let someone else claim that hostname.
