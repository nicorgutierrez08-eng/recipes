// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// NOTE: `site` and `base` are set for GitHub Pages project-site deployment.
// The site will live at https://<user>.github.io/recipes/
// If you deploy to a custom domain or a user/organization page, set base to '/'.
export default defineConfig({
  site: 'https://nicorgutierrez08-eng.github.io',
  base: '/recipes',
  trailingSlash: 'ignore',
  integrations: [react()],
  build: {
    format: 'directory',
  },
});
