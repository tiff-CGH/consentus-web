// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://consentus.org',
  integrations: [mdx()],
  // Workers/Cloudflare Pages-friendly: keep output static (default)
});
