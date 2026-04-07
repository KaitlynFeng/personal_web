# Hayley Feng's Personal Website

A personal tech blog with a geek/terminal-inspired aesthetic and dark-first design.

- **Live**: https://kaitlynfeng.github.io/personal_web/
- **Repo**: https://github.com/KaitlynFeng/personal_web

## About

This site is where I write about technology, paper readings, and things I find interesting. Built to look and feel like a terminal — monospace font, dashed borders, terminal green accent color.

## Tech Stack

- **Framework**: Astro 6 (static site generator)
- **UI**: React 19 (interactive components only)
- **Styling**: Tailwind CSS 4
- **Content**: Markdown / MDX via Astro Content Collections
- **Font**: JetBrains Mono
- **Package Manager**: pnpm
- **Deployment**: GitHub Pages via GitHub Actions

## Project Structure

```
src/
├── components/        # Astro + React components
├── content/blog/      # Blog posts (Markdown files)
├── layouts/           # Page layouts
├── pages/             # Routes: /, /blog, /projects, /about
├── styles/global.css  # Global styles + Tailwind + theme tokens
└── consts.ts          # Site title & description
```

## Commands

```bash
pnpm install   # Install dependencies
pnpm dev       # Start dev server at http://localhost:4321
pnpm build     # Build static site to ./dist
pnpm preview   # Preview build locally
```
