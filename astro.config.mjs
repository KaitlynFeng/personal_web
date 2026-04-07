// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://kaitlynfeng.github.io',
  base: '/personal_web',
  integrations: [mdx(), sitemap(), react()],

  markdown: {
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'img-svg' }],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
