import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  site: 'https://portfolio.noir.ac',
  integrations: [sitemap()]
});