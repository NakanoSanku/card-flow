# 🌊 CardFlow (Masonry.md)

[![Built with Astro](https://camo.githubusercontent.com/260486a23a2512c35c85ebd10e3026cdb1e372070726c51a3e7a018eb5737bbd/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76313f6c6162656c3d415354524f266d6573736167653d352e313526636f6c6f723d303030266c6f676f3d617374726f)](https://astro.build) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Style](https://img.shields.io/badge/Style-TailwindCSS-38B2AC)](https://tailwindcss.com)

**CardFlow** 是一个极简主义的、基于 Markdown 的**瀑布流静态卡片站**。

它没有后端，没有数据库，**你的文件系统就是你的 CMS**。它专为展示 AI 提示词 (Prompts)、代码片段 (Snippets)、工具推荐 (Apps) 或灵感碎片 (Ideas) 而设计。

> 就像是程序员的 Pinterest，但完全由 Markdown 驱动。

---

## ✨ 核心特性

*   **🧱 真·瀑布流布局**：基于 CSS Columns 与 Masonry 算法，实现参差错落的视觉美感，完美适配长短不一的内容。
*   **📝 Markdown 驱动**：一切皆为 `.md` 文件。支持代码高亮、链接、引用等原生 Markdown 语法。
*   **⚡ 极致性能**：基于 **Astro** 构建，构建时生成纯静态 HTML，默认零 JS 运行时，加载速度极快。
*   **🔍 毫秒级搜索**：内置 Fuse.js，在静态环境中实现全文模糊检索。
*   **🏷️ 标签与过滤**：支持多维度标签筛选，快速定位内容。
*   **🌗 黑暗模式**：自动跟随系统或手动切换，极客标配。
*   **🧩 多态卡片设计**：
    *   **Prompt 卡片**：一键复制提示词。
    *   **Script 卡片**：代码块高亮与复制。
    *   **App 卡片**：展示图标与直达链接。

---

## 🛠️ 技术栈

*   **核心框架**: [Astro 5.0+](https://astro.build/) (SSG)
*   **样式库**: [TailwindCSS](https://tailwindcss.com/)
*   **UI 组件**: React (用于搜索与交互组件)
*   **图标库**: Lucide React
*   **搜索**: Fuse.js

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/cardflow.git
cd cardflow
```

### 2. 安装依赖

```bash
npm install
# 或者
pnpm install
# 或者
yarn
```

### 3. 本地开发

```bash
npm run dev
```
访问 `http://localhost:4321` 即可预览。

---

## 📂 内容管理指南

本项目不需要数据库，所有内容均存储在 `src/content/posts/` 目录下。

### 目录结构示例

```text
src/
├── content/
│   ├── posts/
│   │   ├── midjourney-cyberpunk.md   # 一个 Prompt
│   │   ├── python-automation.md      # 一个脚本
│   │   └── obsidian-intro.md         # 一个应用推荐
│   └── config.ts                     # 内容集合定义
```

### 添加新卡片

在 `src/content/posts/` 下创建一个新的 `.md` 文件，并填写 Frontmatter（头部元数据）：

#### 示例 1：AI 提示词 (Prompt)

```markdown
---
title: "Midjourney 赛博朋克风格人像"
date: 2023-11-01
tags: ["AI绘画", "Midjourney", "赛博朋克"]
type: "prompt"   # 关键字段：决定卡片样式
icon: "🤖"       # 可选：Emoji 或 图片路径
color: "purple"  # 可选：卡片装饰色
---

(这里是备注信息)
这是一个高质量的赛博朋克风格提示词，适用于 V5 版本。

<!-- 下面是需要被复制的内容，建议放在代码块中 -->
```text
A futuristic cyberpunk girl, neon lights, rain, transparent raincoat, tokyo street background, 8k resolution, cinematic lighting --ar 16:9
```

#### 示例 2：工具推荐 (App)

```markdown
---
title: "Obsidian"
date: 2023-10-28
tags: ["笔记", "效率", "知识管理"]
type: "app"
icon: "https://upload.wikimedia.org/wikipedia/commons/1/10/2023_Obsidian_logo.png"
url: "https://obsidian.md"  # 点击卡片跳转的链接
---

Obsidian 是一个基于本地 Markdown 文件的知识库工具。它支持双向链接、图谱视图，拥有丰富的插件生态。
```

#### 示例 3：代码片段 (Script)

```markdown
---
title: "Python 批量重命名文件"
type: "script"
tags: ["Python", "自动化"]
---

用于将当前目录下的所有 `.jpg` 文件按顺序重命名。

```python
import os
# ...代码内容...
```

---

## ⚙️ 配置说明

### 修改站点信息
编辑 `src/consts.ts` 修改网站标题、描述和 SEO 信息。

### 修改布局参数
编辑 `tailwind.config.mjs` 自定义颜色主题。
瀑布流列数可以在 `src/pages/index.astro` 中的 CSS Class 修改（例如 `lg:columns-3` 改为 `lg:columns-4`）。

---

## 📦 部署

本项目构建后为纯静态文件，可以部署在任何静态托管服务上。

### Vercel (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fcardflow)

1.  安装 Vercel CLI 或连接 GitHub 仓库。
2.  构建命令：`npm run build`
3.  输出目录：`dist`

### GitHub Pages

在项目根目录配置 `.github/workflows/deploy.yml` 即可实现自动部署。

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！
如果你想分享你的卡片配置，请直接提交 PR 到 `src/content/posts/`。

## 📄 开源协议

MIT License © 2024 Your Name
