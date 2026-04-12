/**
 * Migration script: MDX files → Postgres DB
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/migrate-posts.ts
 *
 * This reads all MDX files from content/posts/, parses frontmatter,
 * converts markdown to HTML, and inserts into the `posts` table.
 * Content is stored as a simple paragraph-block JSON structure
 * and contentHtml as the rendered HTML.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

// Simple markdown → HTML converter (covers common patterns)
function mdToHtml(md: string): string {
  let html = md;

  // Code blocks (fenced) — must be done FIRST before inline patterns
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Process line by line for block elements
  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;
  let listType = "";
  let inTable = false;
  let tableRows: string[] = [];

  function closeList() {
    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
      listType = "";
    }
  }

  function closeTable() {
    if (inTable) {
      result.push("<table>");
      result.push(...tableRows);
      result.push("</table>");
      inTable = false;
      tableRows = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip if inside pre block
    if (line.startsWith("<pre>") || line.includes("<pre>")) {
      closeList();
      closeTable();
      result.push(line);
      continue;
    }

    // Table rows
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      closeList();
      // Skip separator rows
      if (/^\s*\|[\s:-]+\|/.test(line) && line.includes("---")) continue;

      if (!inTable) inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const tag = tableRows.length === 0 ? "th" : "td";
      tableRows.push(
        `<tr>${cells.map((c) => `<${tag}>${inlineFormat(c)}</${tag}>`).join("")}</tr>`
      );
      continue;
    } else {
      closeTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      result.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      closeList();
      result.push("<hr />");
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      closeList();
      result.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        result.push("<ul>");
        inList = true;
        listType = "ul";
      }
      result.push(`<li>${inlineFormat(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        result.push("<ol>");
        inList = true;
        listType = "ol";
      }
      result.push(`<li>${inlineFormat(olMatch[2])}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      closeList();
      continue;
    }

    // Regular paragraph
    closeList();
    result.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  closeTable();

  return result.join("\n");
}

function inlineFormat(text: string): string {
  // Images
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" />'
  );
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, "<s>$1</s>");

  return text;
}

function mdToBlocks(md: string): unknown[] {
  // Store as a single paragraph block with the raw markdown.
  // This is a simplified approach — the real block editing will use BlockNote's native format.
  return [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Migrated from MDX. Edit to use block editor.", styles: {} }],
    },
  ];
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const postsDir = path.join(process.cwd(), "content", "posts");
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${files.length} MDX files to migrate`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data: frontmatter, content } = matter(raw);

    // Skip test files
    if (slug.startsWith("test-")) {
      console.log(`  SKIP (test): ${slug}`);
      skipped++;
      continue;
    }

    try {
      const html = mdToHtml(content.trim());
      const blocks = mdToBlocks(content.trim());

      await db
        .insert(schema.posts)
        .values({
          id: slug,
          title: frontmatter.title ?? slug,
          date: frontmatter.date
            ? new Date(frontmatter.date).toISOString()
            : new Date().toISOString(),
          description: frontmatter.description ?? "",
          category: frontmatter.category ?? "일반",
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          content: blocks,
          contentHtml: html,
          published: true,
        })
        .onConflictDoUpdate({
          target: schema.posts.id,
          set: {
            title: frontmatter.title ?? slug,
            date: frontmatter.date
              ? new Date(frontmatter.date).toISOString()
              : new Date().toISOString(),
            description: frontmatter.description ?? "",
            category: frontmatter.category ?? "일반",
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            content: blocks,
            contentHtml: html,
            published: true,
            updatedAt: new Date().toISOString(),
          },
        });

      console.log(`  OK: ${slug}`);
      success++;
    } catch (e: any) {
      console.error(`  FAIL: ${slug} — ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone! ${success} migrated, ${skipped} skipped, ${errors} errors`);
}

main();
