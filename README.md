# CardFlow

CardFlow is a content-driven masonry card wall for prompts, scripts, apps, links, and videos. Cards come from Markdown files and are rendered with interactive React components for search, filtering, and quick actions like copying snippets or batching `winget` installs.

**English** | [中文文档](README_CN.md)

## ✨ What’s inside

- **Responsive masonry layout** that measures card heights and balances columns on resize.
- **Fuzzy search + filters** powered by Fuse.js and a horizontal type selector.
- **Multiple card types**: prompts, scripts, videos, apps, GitHub repos, and general websites with per-type actions (copy content, open links, watch video, etc.).
- **Winget install list**: select multiple app cards with `wingetId` to generate a one-click PowerShell install command.
- **Code highlighting** using `marked` with a macOS-style code block shell.
- **Dark mode toggle** with persisted preference.

## 🧱 Project structure

```text
src/
├── assets/                 # Static images
├── components/             # React UI for cards, search, filters, theme, embeds
├── content/
│   ├── posts/              # Markdown sources for all cards
│   └── config.ts           # Astro content collection schema
├── layouts/                # Site layout shell
├── pages/index.astro       # Fetch + render cards
└── styles/global.css       # Global styles
```

Content lives in `src/content/posts/`; each `.md` file becomes a card.

## 🛠️ Development

```bash
npm install
npm run dev
```

Preview at [http://localhost:4321](http://localhost:4321). Additional scripts:

- `npm run build` — build static output to `dist`.
- `npm run preview` — serve the production build locally.

## 📝 Authoring cards

All cards share the same frontmatter schema defined in `src/content/config.ts`:

- `title` (string)
- `date` (optional date)
- `type` (`prompt` | `script` | `video` | `app` | `github` | `website`)
- `icon`, `color`, `image`, `video`, `url` (optional strings)
- `wingetId` (optional, used for batch installs on `app` cards)

Examples:

```markdown
---
title: "Midjourney cyberpunk portrait"
type: "prompt"
color: "purple"
---
A high-quality cyberpunk prompt tuned for Midjourney.
```

```markdown
---
title: "Flow Launcher"
type: "app"
url: "https://www.flowlauncher.com/"
wingetId: "Flow-Launcher.Flow-Launcher"
---
A fast Windows launcher with community plugins.
```

```markdown
---
title: "Great repo"
type: "github"
url: "https://github.com/owner/project"
---
Summary of why this repo matters.
```

- App cards with a `wingetId` can be selected to build a PowerShell command shown at the bottom of the page.
- GitHub cards automatically fetch repo metadata for the title area.
- Scripts and prompts expose a **Copy** action that strips HTML and copies the text.

## 🎨 Customization

- Update global metadata, fonts, or spacing in `src/styles/global.css` and component classes.
- Tailwind utilities are available via `tailwindcss` and `tailwind-merge` for consistent styling.
- Adjust supported types or schema defaults in `src/content/config.ts`.
- Tweak the column breakpoints or empty states in `src/components/Main.tsx`.

## 📦 Deployment

This is a static Astro site. Build with `npm run build` and host the `dist` directory on any static provider (Vercel, Netlify, GitHub Pages, etc.).

## 🤝 Contributing

Issues and PRs are welcome! Add new cards under `src/content/posts/` or extend components for new card behaviors.
