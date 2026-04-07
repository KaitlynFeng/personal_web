# CLAUDE.md

## Project Overview

Hayley Feng's personal tech blog. Geek/terminal-inspired aesthetic, dark-first design.

- **Live**: https://kaitlynfeng.github.io/personal_web/
- **Repo**: https://github.com/KaitlynFeng/personal_web

## Tech Stack

- **Framework**: Astro 6 (static site generator)
- **UI**: React 19 (interactive components only, via `client:load` / `client:visible`)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite` plugin, NOT the old `@astrojs/tailwind`)
- **Content**: Markdown / MDX via Astro Content Collections
- **Font**: JetBrains Mono (monospace everywhere)
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev       # Start dev server at http://localhost:4321
pnpm build     # Build static site to ./dist
pnpm preview   # Preview build locally
```

## Project Structure

```
src/
├── components/        # Astro + React components
│   └── ThemeToggle.tsx  # Only React component (dark/light switch)
├── content/blog/      # Blog posts (Markdown files)
├── layouts/           # Page layouts (BlogPost.astro)
├── pages/             # Routes: /, /blog, /projects, /about, /rss.xml
├── styles/global.css  # Global styles + Tailwind import + theme tokens
└── consts.ts          # Site title & description
```

## Key Conventions

### Writing Blog Posts

Create a `.md` file in `src/content/blog/`:

```markdown
---
title: 'Post Title'
description: 'Short description'
pubDate: 2026-04-07
tags: ['tag1', 'tag2']
heroImage: '../../assets/some-image.jpg'  # optional
---

Content here...
```

Schema is defined in `src/content.config.ts`. Fields `title`, `description`, `pubDate` are required. `tags`, `heroImage`, `updatedDate` are optional.

### Adding Projects

Edit the `projects` array in `src/pages/projects.astro`. Each project has:
- `name`, `description`, `tech` (required)
- `status`: `'active'` | `'wip'` | `'planned'` | `'archived'`
- `repo`, `docs`, `url` (optional links)

### Theme / Styling

- Dark mode is **default**. Light mode toggled by adding `.light` class to `<html>`.
- Theme colors defined as CSS custom properties in `global.css` under `@theme {}`.
- Terminal green `#22c55e` is the primary accent. Cyan `#06b6d4` for secondary.
- Use Tailwind utility classes. For dark/light variants use: `text-green-400 light:text-green-600` pattern.
- Borders are **dashed** (`border-dashed`) to maintain the handcrafted terminal feel.

### React Components

Only use React for components that need client-side interactivity. Always specify a hydration directive:
- `client:load` — hydrate immediately (e.g., ThemeToggle)
- `client:visible` — hydrate when scrolled into view (preferred for non-critical UI)

Static content should use `.astro` files, NOT React.

## Deployment

- **Platform**: GitHub Pages
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Flow**: Push to `main` → Actions builds → deploys to Pages automatically
- **Base path**: `/personal_web` (configured in `astro.config.mjs`)
- Build output is pure static HTML in `./dist`

## Publishing a Blog Post (Complete Workflow)

End-to-end steps for taking a new technical blog post from draft to live.

### 1. Create the post file

```bash
# Create markdown file — filename becomes the URL slug
src/content/blog/<slug>.md
# e.g. src/content/blog/evo-memory.md → /blog/evo-memory/
```

Required frontmatter:

```markdown
---
title: 'Post Title'
description: 'Short description for SEO & card preview'
pubDate: 2026-04-07          # YYYY-MM-DD
tags: ['AI', 'Paper Reading'] # optional
heroImage: '../../assets/xxx.jpg' # optional cover image
---
```

### 2. Add images (if any)

Place images in `src/assets/<slug>/` and reference them with relative paths:

```markdown
![Alt text](../../assets/<slug>/image-name.png)
```

Astro will auto-optimize images (convert to WebP, resize) at build time.

### 3. Check for new dependencies

If the post uses features that need extra packages (e.g. Mermaid diagrams need `rehype-mermaid` + `playwright`), install them:

```bash
pnpm add <package>
# For Mermaid specifically:
pnpm add rehype-mermaid
pnpm add -D playwright && npx playwright install chromium
```

And update `astro.config.mjs` if needed (e.g. add rehype plugins to `markdown.rehypePlugins`).

### 4. Local build verification

```bash
pnpm build    # Must exit 0 with no errors
```

Check the output for:
- ✅ Post page generated (e.g. `/blog/<slug>/index.html`)
- ✅ All images optimized (no missing asset errors)
- ✅ No broken Mermaid / MDX / LaTeX rendering

Optional: `pnpm preview` to visually inspect at `http://localhost:4321/personal_web/`.

### 5. Commit & push

```bash
git add src/content/blog/<slug>.md src/assets/<slug>/ # post + images
git add astro.config.mjs package.json pnpm-lock.yaml  # only if changed
git commit -m "Add blog post: <title>"
git push origin main
```

> ⚠️ This repo uses **project-level** git config (KaitlynFeng). Do NOT use the global/company account.

### 6. Verify deployment

Push to `main` triggers GitHub Actions automatically (`.github/workflows/deploy.yml`).

```bash
gh run list --limit 1                  # Check Actions status
gh run watch                           # Live tail the run (optional)
```

Once the run succeeds, the post is live at:

```
https://kaitlynfeng.github.io/personal_web/blog/<slug>/
```

### Quick reference (copy-paste)

```bash
# Full publish sequence
pnpm build \
  && git add src/content/blog/<slug>.md src/assets/<slug>/ \
  && git commit -m "Add blog post: <title>" \
  && git push origin main \
  && gh run watch
```

---

## Git Config

This project uses project-level git config (not global):
- **user**: KaitlynFeng
- **email**: yiyangfeng0911@gmail.com

Do NOT use the global git config (which is the company account).
