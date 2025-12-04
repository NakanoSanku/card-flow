# 🌊 CardFlow (Masonry.md)

[![Built with Astro](https://camo.githubusercontent.com/260486a23a2512c35c85ebd10e3026cdb1e372070726c51a3e7a018eb5737bbd/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76313f6c6162656c3d415354524f266d6573736167653d352e313526636f6c6f723d303030266c6f676f3d617374726f)](https://astro.build) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Style](https://img.shields.io/badge/Style-TailwindCSS-38B2AC)](https://tailwindcss.com)

**CardFlow** is a minimalist, Markdown-powered **masonry card site** for prompts, code snippets, app recommendations, and idea fragments. It is fully static—no backend, no database—your file system is the CMS.

**English** | [中文文档](README_CN.md)

---

## ✨ Highlights

* **🧱 True masonry layout** powered by CSS columns for an organic, staggered grid that adapts to uneven card heights.
* **📝 Markdown-first** content: every card is a `.md` file with syntax highlighting, links, and blockquotes out of the box.
* **⚡ Blazing fast** static output via **Astro**, shipping zero JS at runtime by default.
* **🔍 Millisecond search** with Fuse.js for fuzzy, client-side querying on static builds.
* **🏷️ Tags & filtering** to quickly narrow down cards by multiple facets.
* **🌗 Dark mode** that follows the system theme or manual toggle.
* **🧩 Polymorphic cards** for different content types:
  * **Prompt cards** with one-click copy.
  * **Script cards** with highlighted, copyable code blocks.
  * **App cards** with icons and external links.

---

## 🛠️ Tech Stack

* **Core framework**: [Astro 5.0+](https://astro.build/) (SSG)
* **Styling**: [TailwindCSS](https://tailwindcss.com/)
* **UI components**: React (for search and interactive pieces)
* **Icons**: Lucide React
* **Search**: Fuse.js

---

## 🚀 Getting Started

### 1) Clone the repo

```bash
git clone https://github.com/your-username/cardflow.git
cd cardflow
```

### 2) Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn
```

### 3) Start the dev server

```bash
npm run dev
```
Preview at `http://localhost:4321`.

---

## 📂 Content Management

All content lives in `src/content/posts/`; no database is required.

### Directory layout

```text
src/
├── content/
│   ├── posts/
│   │   ├── midjourney-cyberpunk.md   # a prompt
│   │   ├── python-automation.md      # a script
│   │   └── obsidian-intro.md         # an app recommendation
│   └── config.ts                     # content collection schema
```

### Add a new card

Create a new `.md` file in `src/content/posts/` with frontmatter describing the card.

#### Example: AI prompt

```markdown
---
title: "Midjourney cyberpunk portrait"
date: 2023-11-01
tags: ["AI art", "Midjourney", "cyberpunk"]
type: "prompt"   # required: drives the card layout
icon: "🤖"       # optional: emoji or image path
color: "purple"  # optional: accent color
---

(Optional notes)
A high-quality cyberpunk prompt tuned for Midjourney V5.

<!-- Content to copy, ideally inside a code block -->
```text
A futuristic cyberpunk girl, neon lights, rain, transparent raincoat, tokyo street background, 8k resolution, cinematic lighting
 --ar 16:9
```

#### Example: App recommendation

```markdown
---
title: "Obsidian"
date: 2023-10-28
tags: ["notes", "productivity", "knowledge base"]
type: "app"
icon: "https://upload.wikimedia.org/wikipedia/commons/1/10/2023_Obsidian_logo.png"
url: "https://obsidian.md"  # link to open when clicking the card
---

Obsidian is a local-first Markdown knowledge base with backlinks, graph view, and a rich plugin ecosystem.
```

#### Example: Code snippet

```markdown
---
title: "Python batch rename"
type: "script"
tags: ["Python", "automation"]
---

Rename all `.jpg` files in the current directory sequentially.

```python
import os
# ...code here...
```

---

## ⚙️ Configuration

* Edit `src/consts.ts` for site title, description, and SEO metadata.
* Customize the color palette in `tailwind.config.mjs`.
* Adjust masonry columns in `src/pages/index.astro` via CSS classes (e.g., change `lg:columns-3` to `lg:columns-4`).

---

## 📦 Deployment

The site builds to static HTML and can be hosted on any static provider.

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NakanoSanku/card-flow)

1. Install the Vercel CLI or connect the repo on Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`

### GitHub Pages

Add a GitHub Actions workflow in `.github/workflows/deploy.yml` to enable automatic deployment.

---

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a PR. To share a new card, add your `.md` file under `src/content/posts/`.

## 📄 License

MIT License © 2024 Your Name
