/**
 * Image migration: /public/images/ → Vercel Blob + DB URL 교체
 *
 * Usage: npx dotenv -e .env.local -- npx tsx scripts/migrate-images.ts
 *
 * 1. public/images/ 의 모든 이미지를 Vercel Blob에 업로드
 * 2. posts.content_html 내 로컬 경로를 Blob URL로 치환
 * 3. blob_files 테이블에 메타데이터 기록
 */

import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { randomUUID } from "crypto";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/** 재귀적으로 디렉토리 내 모든 파일 수집 */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const url = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!url || !blobToken) {
    console.error("DATABASE_URL and BLOB_READ_WRITE_TOKEN required");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const publicDir = path.join(process.cwd(), "public");
  const imagesDir = path.join(publicDir, "images");

  if (!fs.existsSync(imagesDir)) {
    console.error("public/images/ not found");
    process.exit(1);
  }

  // 1. 모든 이미지 파일 수집
  const allFiles = walkDir(imagesDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext in MIME;
  });

  console.log(`Found ${allFiles.length} images to upload\n`);

  // 2. 업로드 + URL 매핑 구축
  const urlMap: Record<string, string> = {}; // "/images/xxx" → "https://blob..."
  let uploaded = 0;
  let errors = 0;

  for (const filePath of allFiles) {
    const relativePath = "/" + path.relative(publicDir, filePath); // "/images/notion/docker/image-1.png"
    const blobPathname = `devs-vltra${relativePath}`; // "devs-vltra/images/notion/docker/image-1.png"
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const blob = await put(blobPathname, fileBuffer, {
        access: "public",
        contentType,
        token: blobToken,
      });

      urlMap[relativePath] = blob.url;

      // blob_files 테이블에 기록
      const stat = fs.statSync(filePath);
      // 포스트 슬러그 추출 (예: /images/notion/docker/... → docker)
      const parts = relativePath.split("/");
      let postSlug: string | null = null;
      if (parts.length >= 4 && parts[2] === "notion") {
        postSlug = parts[3]; // notion 하위 폴더명 = 포스트 슬러그
      } else if (parts.length >= 3) {
        postSlug = parts[2]; // /images/military-service/... → military-service
      }

      // slug가 military-service인 경우 실제 DB의 id와 맞는지 확인
      if (postSlug === "military-service") {
        postSlug = "military-service-exception";
      }

      await db
        .insert(schema.blobFiles)
        .values({
          id: randomUUID(),
          url: blob.url,
          pathname: blob.pathname,
          size: stat.size,
          contentType,
          postSlug,
        })
        .onConflictDoNothing();

      uploaded++;
      console.log(`  ✓ ${relativePath}`);
    } catch (e: any) {
      errors++;
      console.error(`  ✗ ${relativePath} — ${e.message}`);
    }
  }

  console.log(`\nUpload done: ${uploaded} ok, ${errors} errors`);

  // 3. DB의 content_html에서 로컬 경로 → Blob URL 치환
  console.log("\nUpdating content_html in DB...");

  const rows = await sql`SELECT id, content_html FROM posts WHERE content_html IS NOT NULL`;
  let updatedPosts = 0;

  for (const row of rows) {
    let html: string = row.content_html ?? "";
    let changed = false;

    for (const [localPath, blobUrl] of Object.entries(urlMap)) {
      if (html.includes(localPath)) {
        // 모든 출현 치환 (src="...", href="..." 등)
        html = html.split(localPath).join(blobUrl);
        changed = true;
      }
    }

    if (changed) {
      await db
        .update(schema.posts)
        .set({ contentHtml: html, updatedAt: new Date().toISOString() })
        .where(eq(schema.posts.id, row.id));
      updatedPosts++;
      console.log(`  ✓ Updated: ${row.id}`);
    }
  }

  console.log(`\n완료! ${uploaded} images uploaded, ${updatedPosts} posts updated`);
  console.log("이제 /public/images/ 와 /content/ 폴더를 안전하게 삭제할 수 있습니다.");
}

main();
