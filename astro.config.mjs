import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages 子路徑部署：BASE_PATH=/repo-name  SITE_URL=https://<user>.github.io
export default defineConfig({
  site: process.env.SITE_URL || 'https://neogeo-museum.example',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
