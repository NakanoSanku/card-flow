import fs from "node:fs/promises";
import path from "node:path";

const postsDir = path.join(process.cwd(), "src", "content", "posts");
const outputDir = path.join(process.cwd(), "src", "data");
const outputFile = path.join(outputDir, "github-meta.json");

/**
 * Very small frontmatter parser for this project:
 * assumes the file starts with `---` and uses JSON-like keys with double quotes.
 * This is enough for our `type` and `url` fields.
 */
async function readFrontmatter(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const start = raw.indexOf("---");
  if (start !== 0) return {};

  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};

  const fmBlock = raw.slice(3, end).trim();
  const lines = fmBlock.split(/\r?\n/);
  const data = {};

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return data;
}

function parseGithubUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repo] = parts;
    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}

async function fetchRepoMeta(repoFullName) {
  const apiUrl = `https://api.github.com/repos/${repoFullName}`;

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} for ${repoFullName}`);
  }

  const data = await res.json();

  return {
    full_name: data.full_name,
    description: data.description,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    open_issues_count: data.open_issues_count,
    language: data.language,
    html_url: data.html_url,
  };
}

async function main() {
  try {
    const entries = await fs.readdir(postsDir);
    const meta = {};

    for (const entry of entries) {
      if (!entry.endsWith(".md")) continue;
      const filePath = path.join(postsDir, entry);

      const frontmatter = await readFrontmatter(filePath);
      if (frontmatter.type !== "github") {
        continue;
      }

      const urlValue = frontmatter.url || "";
      const repoKey = parseGithubUrl(urlValue);
      if (!repoKey) continue;

      if (meta[repoKey]) continue;

      try {
        // eslint-disable-next-line no-console
        console.log(`Fetching GitHub metadata for ${repoKey}...`);
        const repoMeta = await fetchRepoMeta(repoKey);
        meta[repoKey] = repoMeta;
        // Be polite to GitHub API, even though this runs at build time
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to fetch metadata for ${repoKey}:`, err.message);
      }
    }

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(meta, null, 2), "utf8");
    // eslint-disable-next-line no-console
    console.log(
      `GitHub metadata written to ${path.relative(process.cwd(), outputFile)}`
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error while generating GitHub metadata:", err);
    process.exitCode = 1;
  }
}

main();
