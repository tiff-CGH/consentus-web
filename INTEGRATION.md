# Consentus — site integration guide

This bundle replaces the Astro starter content with the Consentus site as designed
in our chat. Follow the steps below in order.

## What's in this bundle

```
consentus-web/
├── astro.config.mjs              # Adds MDX integration
├── public/
│   └── favicon.svg               # Simple wordmark favicon
└── src/
    ├── components/
    │   ├── ProcedureCard.astro   # Card used on listings and homepage
    │   ├── SiteFooter.astro      # Site-wide footer
    │   ├── SiteHeader.astro      # Site-wide header / nav
    │   └── VideoPlayer.astro     # Cloudflare Stream facade — see notes
    ├── content/
    │   ├── config.ts             # Procedure collection schema
    │   └── procedures/
    │       └── bilateral-mastopexy.mdx   # Example procedure (DRAFT)
    ├── layouts/
    │   └── BaseLayout.astro      # Site-wide HTML shell
    ├── pages/
    │   ├── about.astro
    │   ├── for-clinicians.astro
    │   ├── index.astro           # Homepage
    │   └── procedures/
    │       ├── [slug].astro      # Dynamic procedure page (the core unit)
    │       └── index.astro       # Procedures listing
    └── styles/
        └── global.css            # Design tokens + base typography
```

## Step 1 — Install the MDX integration

In your repo root, run:

```bash
npm install @astrojs/mdx
```

This is the only new dependency. Astro Content Collections is built in.

## Step 2 — Drop the files in

Copy everything inside `consentus-web/` into your repo root, **overwriting**
the corresponding files. Specifically, this means you'll be replacing:

- `astro.config.mjs`
- `public/favicon.svg`
- `src/pages/index.astro`
- And adding everything else (it's all new).

If your starter has a `src/layouts/Layout.astro` from the minimal template,
delete it — we use `BaseLayout.astro` instead, and nothing references the old
file.

## Step 3 — Run locally

```bash
npm run dev
```

Open `http://localhost:4321`. You should see:

- Homepage with hero, featured procedure (Bilateral mastopexy), and three-step explainer
- `/procedures` listing showing the bilateral mastopexy entry
- `/procedures/bilateral-mastopexy` showing the full procedure page with placeholder video, body content, FAQ, and disclaimer
- `/about` and `/for-clinicians`

The bilateral mastopexy procedure is marked `draft: true` — in dev mode it appears,
in production it won't, until you remove that flag. This protects you from
publishing unreviewed clinical content by accident.

## Step 4 — Push and deploy

```bash
git add .
git commit -m "Replace Astro starter with Consentus site"
git push
```

Cloudflare Workers will auto-deploy from your repo.

---

## Cloudflare Stream integration — when you're ready

The `VideoPlayer.astro` component is built around a **facade pattern**: it shows
a static poster image with a play button, and only loads the actual Cloudflare
Stream iframe when the user clicks. This means:

- **Zero Stream delivery cost on idle pageviews.** Only people who click "play" trigger billable delivery.
- **No third-party JS or network requests to Cloudflare on page load.** Privacy-clean by default.
- **Better Core Web Vitals.** No iframe blocks initial render.

### When you have your first video uploaded:

1. Open the Stream dashboard, find your video, and copy:
   - The **video ID** (a hex string)
   - Your **customer code** (in the embed URL, between `customer-` and `.cloudflarestream.com`)
2. In `src/components/VideoPlayer.astro`, find the line:
   ```ts
   const CLOUDFLARE_CUSTOMER_CODE = 'CUSTOMER_CODE_PLACEHOLDER';
   ```
   Replace `CUSTOMER_CODE_PLACEHOLDER` with your actual customer code.
3. In the procedure's MDX file (e.g. `bilateral-mastopexy.mdx`), uncomment and fill:
   ```yaml
   streamId: "your-video-id-here"
   posterUrl: "/posters/bilateral-mastopexy.jpg"  # optional
   ```
4. Set `draft: false` (or remove the line) to publish.
5. (Optional but recommended) Place a poster image at `public/posters/bilateral-mastopexy.jpg` — a still frame from the video, exported at ~1280×720. Without it the placeholder gradient renders instead.

### Cost mitigation checklist (when Stream goes live)

- [ ] In the Cloudflare Stream dashboard, set **Allowed Origins** for each video to `consentus.org` (and `localhost:4321` for dev). This prevents anyone from embedding your videos elsewhere and racking up your bill.
- [ ] In Cloudflare account settings, set a **Billing Notification** at $20/month. This is post-hoc but gives you signal.
- [ ] Keep the facade pattern (already built in). Do not switch to autoloading iframes.
- [ ] When you're not actively running clinician outreach, you can take procedure pages offline simply by setting `draft: true` in the MDX file. Storage is prepaid (committed) but delivery falls to zero with no traffic.

### Going dark for a month

If your day job pulls you away and you want zero Stream cost:

1. Set `draft: true` on every procedure MDX file → delivery drops to zero.
2. To go further, in the Stream dashboard delete the videos. Source files stay on your laptop. Re-uploading later is free, encoding is free.
3. Cancel the Stream subscription in Cloudflare billing if you want absolute zero.

---

## Adding more procedures

Each procedure is a single MDX file in `src/content/procedures/`. The schema in
`src/content/config.ts` enforces required fields. To add a new one:

1. Copy `bilateral-mastopexy.mdx` to a new filename (the filename becomes the URL slug).
2. Update the frontmatter — `title`, `summary`, `clinician`, `gmcNumber`, `specialty`, dates, FAQs.
3. Replace the body content with content drafted and reviewed by the named clinician.
4. Keep `draft: true` until clinical sign-off is received.
5. Remove `draft: true` to publish.

The procedure will automatically appear on the `/procedures` listing and (if it
has the most recent `publishedAt` date) feature on the homepage.

## What's NOT in here (deliberate)

- **No analytics.** Patient-facing pages are tracker-free by design. If you want
  basic privacy-respecting analytics later, Plausible (~£8/month) or Cloudflare
  Web Analytics (free, no cookies) are the right options.
- **No CMS.** Markdown in the repo is correct for the first 5–10 contributors.
  Move to Supabase or similar when the editorial workflow needs it.
- **No comments / patient interaction.** Out of scope for this product.
- **No clinician dashboard or login.** That's for the B2B platform later.

## Questions you'll hit later

- **Custom Stream player styling.** The Stream iframe is themable via URL params (`primaryColor`, etc., already wired) and via custom CSS through their newer Player API. Worth revisiting once you have the first video live.
- **Captions.** Stream auto-generates captions; you can upload edited VTT files via the dashboard. Important for accessibility — switch on once content is live.
- **Search.** With 5+ procedures, add a simple client-side search using Pagefind (free, static-friendly). With 20+, consider Algolia or similar.
- **Sitemap / SEO.** Add `@astrojs/sitemap` once you have public content (one line in the config).
