import { defineConfig, passthroughImageService } from 'astro/config';

// Static site. The hand-built homepage lives in public/index.html and is
// served verbatim (Astro never touches it). Astro builds the /newsroom route
// alongside it. One `astro build` -> dist/, which Netlify publishes.
export default defineConfig({
  site: 'https://www.sonical.ai',
  // All images are pre-sized files in public/ referenced by URL — no Astro
  // image processing needed, so skip the sharp native dependency.
  image: { service: passthroughImageService() },
});
