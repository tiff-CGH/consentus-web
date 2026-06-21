# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Build to ./dist
npm run preview    # Preview the built output locally
```

No test suite or linter is configured yet. TypeScript checking is via `astro/tsconfigs/strict`.

## Architecture

This is a static Astro site deployed to Cloudflare Pages via `wrangler.jsonc`. The output is fully static (no Astro SSR adapter).

### Content pipeline

Procedures are MDX files in `src/content/procedures/`. The collection schema lives in `src/content.config.ts` and is enforced at build time by Zod. The file name becomes the URL slug (e.g. `bilateral-mastopexy.mdx` → `/procedures/bilateral-mastopexy`).

**Draft guard:** procedures with `draft: true` are excluded from the production build but visible in dev. Never remove this flag before clinical sign-off.

### Page structure

- `src/layouts/BaseLayout.astro` — HTML shell with `<head>` meta, OG tags, skip-link, header/footer slots
- `src/pages/procedures/[slug].astro` — dynamic route that renders a single procedure: header/attribution, video, prose body (MDX), FAQ accordion, disclaimer
- `src/pages/procedures/index.astro` — listing page
- `src/pages/index.astro` — homepage (features most-recently-published procedure)

### VideoPlayer facade

`src/components/VideoPlayer.astro` renders either a "Video coming soon" placeholder (no `streamId`) or a static poster + play button that lazily injects a Cloudflare Stream `<iframe>` only on click. This avoids Stream delivery charges on idle pageviews and avoids any third-party network request at page load.

To wire up a real video:
1. Set `CLOUDFLARE_CUSTOMER_CODE` in the `<script>` block of `VideoPlayer.astro`
2. Add `streamId` (and optionally `posterUrl`) to the procedure's MDX frontmatter
3. Place poster images at `public/posters/<slug>.jpg` (1280×720)

### Styling

`src/styles/global.css` defines all design tokens as CSS custom properties (`--color-*`, `--font-*`, `--space-*`). Component-level styles are scoped inside each `.astro` file's `<style>` block. No CSS framework or preprocessor is used.

Fonts: **Newsreader** (serif, for headings and FAQ questions) + **Inter** (sans, for body and UI), loaded from Google Fonts in `BaseLayout.astro`.

### Procedure MDX frontmatter schema

Required fields: `title`, `summary`, `clinician`, `gmcNumber`, `specialty`, `lastReviewed` (ISO date), `publishedAt` (ISO date).  
Optional: `streamId`, `posterUrl`, `faqs[]` (array of `{question, answer}`), `featured` (boolean), `draft` (boolean, defaults `false`).

## Adding a new procedure

1. Copy `src/content/procedures/bilateral-mastopexy.mdx` to a new file — the filename is the slug.
2. Update all frontmatter fields; keep `draft: true` until clinical review.
3. Write the body content in MDX below the frontmatter.
4. Set `draft: false` (or remove the line) to publish.

## Deployment

Cloudflare Workers auto-deploys from the connected git repo. The `wrangler.jsonc` config serves `./dist` as static assets with 404-page fallback. No manual deploy step is needed after pushing to the main branch.
