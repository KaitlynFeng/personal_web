---
title: 'Why I Chose Astro for My Blog'
description: 'A deep dive into why Astro is the perfect framework for content-heavy websites, and how it compares to traditional React SPAs.'
pubDate: 2026-04-03
tags: ['Astro', 'Web Dev', 'Architecture']
heroImage: '../../assets/blog-placeholder-2.jpg'
---

## The Problem with SPAs for Blogs

As someone who builds React SPAs daily, my first instinct was to build this blog with Next.js or even a custom FastAPI + React setup. But then I asked myself: **does a blog really need all that JavaScript?**

The answer is no. A blog is fundamentally a **content website**. Visitors come to read text, not to interact with a complex UI. Shipping hundreds of kilobytes of JavaScript just to render markdown feels wrong.

## Enter Astro

Astro takes a radically different approach: **ship zero JavaScript by default**. It renders everything to static HTML at build time, and only hydrates interactive components when you explicitly ask for it.

```astro
---
// This runs at build time, not in the browser
const posts = await getCollection('blog');
---

<!-- This becomes pure HTML - zero JS! -->
<ul>
  {posts.map(post => (
    <li><a href={`/blog/${post.id}`}>{post.data.title}</a></li>
  ))}
</ul>

<!-- Only THIS gets JavaScript (React component) -->
<SearchBar client:visible />
```

The `client:visible` directive is the magic. It tells Astro: "Only load the JavaScript for this component when it scrolls into view." This is called **Island Architecture**.

## Astro vs My Usual Stack

| Feature | FastAPI + React | Astro |
|---|---|---|
| Backend needed | Yes (API server) | No |
| Database | Required | Markdown files |
| Build output | Dynamic app | Static HTML |
| JavaScript sent | ~200KB+ | Near zero |
| Hosting cost | Server $$ | Free (CDN) |
| Deploy complexity | Docker + CI | `git push` |

## What I Love About Astro

### 1. Content Collections

Blog posts are just markdown files with typed frontmatter:

```markdown
---
title: 'My Post'
pubDate: 2026-04-03
tags: ['web dev']
---

Write your content here...
```

Astro validates the frontmatter at build time with Zod schemas. Type safety for content!

### 2. Framework Agnostic

I can use my React skills when I need interactivity:

```tsx
// A React component that works inside Astro
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  return <button onClick={() => setDark(!dark)}>Toggle</button>;
}
```

### 3. Lightning Fast

Since pages are pre-rendered HTML, the initial load is almost instant. No JavaScript bundle to parse, no hydration waterfall. Just HTML and CSS.

## The Verdict

If you're building a content-heavy website (blog, docs, portfolio), **Astro is the best choice in 2026**. Save your React and FastAPI skills for the projects that actually need them - the complex, interactive web applications.

For everything else, there's Astro.
