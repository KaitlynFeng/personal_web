// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import rehypeMermaid from 'rehype-mermaid';
import rehypeShiki from '@shikijs/rehype';

// https://astro.build/config
export default defineConfig({
  site: 'https://kaitlynfeng.github.io',
  base: '/personal_web',
  integrations: [mdx(), sitemap(), react()],

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'img-svg' }],
      [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: 'dark' }],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
