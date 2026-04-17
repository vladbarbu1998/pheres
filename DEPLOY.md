# PHERES Next.js Deploy Checklist

Production deployment of `pheres-next` (Next.js 15 / App Router) to Vercel,
replacing the previous Vite SPA at `pheres.com`.

---

## 1. Pre-deploy verification (local)

```bash
cd /home/lrn/Projects/pheres-next
bun install
bun run build               # must pass cleanly, no type errors
bun run dev                 # smoke test on http://localhost:3000
curl -s http://localhost:3000/sitemap.xml | head -20
curl -s http://localhost:3000/robots.txt
```

Confirm:
- `bun run build` exit code 0
- `/sitemap.xml` returns valid XML with 200+ URLs
- `/robots.txt` returns the expected rules
- Homepage, a product page, a couture page, and `/admin/login` all return 200

---

## 2. Vercel project setup

1. Create new project: `vercel link` (or via dashboard "Add New Project").
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: repo root (the directory containing `package.json`).
4. Build command: `bun run build` (or leave default `next build`).
5. Install command: `bun install`.
6. Output directory: `.next` (default, do not override).
7. Node version: 20.x (matches local).

### Required environment variables

Set these in **Project Settings -> Environment Variables** for `Production`,
`Preview`, and `Development` scopes:

| Name                              | Source                            | Notes                       |
| --------------------------------- | --------------------------------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project settings -> API  | Public, safe to expose      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase project settings -> API  | Public anon key             |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase project settings -> API  | **Server-only**, never NEXT_PUBLIC_ |
| `NEXT_PUBLIC_SITE_URL`            | `https://pheres.com`              | Used for canonical / OG URLs |

If Stripe / payment / email services are wired in: add their secrets here too.
Audit `.env.example` and `src/integrations/**` before going live.

### Pull env vars locally for parity

```bash
vercel env pull .env.local
```

---

## 3. First production deploy

```bash
# Preview deploy first
vercel

# Verify the preview URL — open it, click around, check console
# Then promote to production
vercel --prod
```

The first prod deploy creates a `*.vercel.app` URL — do NOT switch DNS yet.

---

## 4. DNS / domain switch (`pheres.com`)

Cloudflare-managed (assumed). Keep the OLD project alive until the new one is verified.

1. In Vercel: **Project -> Settings -> Domains -> Add `pheres.com` and `www.pheres.com`**.
   Vercel will prompt for verification records.
2. In Cloudflare DNS:
   - Update `A` / `CNAME` for `pheres.com` and `www.pheres.com` to point at Vercel
     (`cname.vercel-dns.com` for apex via CNAME flattening; or the IPs Vercel provides).
   - Set proxy status to **DNS only** (grey cloud) initially so Vercel can issue the cert.
   - After Vercel reports the cert is issued, you can re-enable proxy if desired,
     but Vercel's edge already handles cache + TLS — proxying through Cloudflare
     is optional.
3. Wait for DNS propagation (typically 1-5 min on Cloudflare).
4. Confirm:
   ```bash
   dig +short pheres.com
   curl -sI https://pheres.com/ | head -10
   ```

---

## 5. Post-deploy verification (production)

Run all of these against the live domain:

```bash
# Homepage
curl -sI https://pheres.com/ | head -3
curl -s https://pheres.com/ | grep -oE "<title>[^<]+</title>"

# Sitemap + robots
curl -s https://pheres.com/sitemap.xml | grep -c "<url>"     # expect 200+
curl -s https://pheres.com/robots.txt

# Sample dynamic routes
curl -sI https://pheres.com/shop | head -3
curl -sI https://pheres.com/collections | head -3
curl -sI https://pheres.com/shop/pendants/cacciavite | head -3
curl -sI https://pheres.com/couture | head -3

# Crawler view
curl -s -A "GPTBot" https://pheres.com/ | grep -oP "PHERES|jewelry|Hong Kong" | wc -l

# Product page metadata
curl -s https://pheres.com/shop/pendants/cacciavite | \
  grep -oE "<title>[^<]+</title>|<meta name=\"description\"[^>]+>" | head -3
```

All HEAD requests must return `200`. Sitemap must contain >200 URLs.

---

## 6. Search engine submission

1. **Google Search Console** (https://search.google.com/search-console)
   - Add property `https://pheres.com` (Domain or URL prefix)
   - Verify via DNS TXT (Cloudflare) or HTML meta tag
   - Submit sitemap: `https://pheres.com/sitemap.xml`
   - Request re-indexing for `/`, `/shop`, `/story`
2. **Bing Webmaster Tools** (https://www.bing.com/webmasters)
   - Add `https://pheres.com`
   - Import settings from Google Search Console (one-click)
   - Submit sitemap manually if needed
3. **Cloudflare Web Analytics** (optional): re-enable if previously configured.

---

## 7. Monitoring & smoke tests (first 24h)

- Vercel dashboard -> Deployments -> Logs: watch for runtime errors.
- Vercel -> Analytics: confirm traffic is flowing (after DNS swap).
- Supabase dashboard -> Database -> watch query volume for unusual spikes.
- Manually test each critical flow:
  - Homepage hero loads
  - Shop filtering + pagination
  - Product page -> add to cart -> checkout (full flow if payments live)
  - Admin login + product CRUD
  - Couture inquiry form submit (confirms Supabase write)

---

## 8. Rollback plan

If anything is broken after DNS swap, roll back DNS in **under 5 minutes**:

1. **Cloudflare DNS** -> revert `pheres.com` and `www.pheres.com` records to the
   previous Vite/Lovable target. Keep the old hosting alive until rollback window
   has fully closed.
2. Drop Cloudflare cache: **Caching -> Configuration -> Purge Everything**.
3. Verify rollback:
   ```bash
   curl -sI https://pheres.com/ | head -3
   ```
4. Investigate the failure on the Vercel preview URL without user pressure.
5. Re-attempt deploy after fix.

If the Next.js deploy itself fails (build error on Vercel) — DNS does NOT need
to change; the old site stays up. Just push a fix and redeploy.

If a bad commit reaches production: in Vercel **Deployments -> "Promote to Production"**
on the previous good deploy. Instant rollback, no rebuild.

---

## 9. Known follow-ups (post-launch)

- Add `revalidate` / `unstable_cache` to expensive Supabase queries on hot pages.
- Configure Vercel Image Optimization domains for `wxjjpkmdzejmzlixgxhu.supabase.co`.
- Monitor `sitemap.xml` size — if it grows past ~50k URLs, split into a sitemap index.
- Add Sentry / OpenTelemetry once Vercel project is stable.
