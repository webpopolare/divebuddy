import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://divebuddy.example',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/draft/'),
    }),
  ],
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
});