/**
 * 백업 스크립트
 *
 * 실행:  npx tsx scripts/backup.ts
 * 결과:  backups/backup-YYYY-MM-DD.json  (글 데이터)
 *        backups/images/                 (이미지 파일, --images 플래그 시)
 *
 * 옵션:
 *   --images   Vercel Blob 이미지도 함께 다운로드
 *   --out DIR  출력 디렉터리 지정 (기본: ./backups)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const args = process.argv.slice(2);
const downloadImages = args.includes("--images");
const outIndex = args.indexOf("--out");
const outDir = outIndex !== -1 ? args[outIndex + 1] : "./backups";

async function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = url.startsWith("https") ? https.get : http.get;
    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location!, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    }).on("error", (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("📦 백업 시작...");

  // 글 전체 조회
  const posts = await db.select().from(schema.posts);
  const blobs = await db.select().from(schema.blobFiles);

  const dateStr = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(outDir, { recursive: true });

  const backupFile = path.join(outDir, `backup-${dateStr}.json`);
  const payload = {
    exportedAt: new Date().toISOString(),
    counts: { posts: posts.length, blobs: blobs.length },
    posts,
    blobs,
  };

  fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`✅ 글 데이터 저장: ${backupFile}`);
  console.log(`   - 글: ${posts.length}개`);
  console.log(`   - Blob 레코드: ${blobs.length}개`);

  // 이미지 다운로드 (--images 플래그)
  if (downloadImages) {
    const imgDir = path.join(outDir, "images");
    fs.mkdirSync(imgDir, { recursive: true });

    const activeBlobs = blobs.filter((b) => !b.isDeleted);
    console.log(`\n🖼  이미지 다운로드 (${activeBlobs.length}개)...`);

    let ok = 0;
    let fail = 0;
    for (const blob of activeBlobs) {
      const filename = path.basename(blob.pathname);
      const dest = path.join(imgDir, filename);
      if (fs.existsSync(dest)) {
        ok++;
        continue;
      }
      try {
        await download(blob.url, dest);
        process.stdout.write(`  ✓ ${filename}\n`);
        ok++;
      } catch (e) {
        process.stdout.write(`  ✗ ${filename} (${e})\n`);
        fail++;
      }
    }
    console.log(`\n   성공: ${ok}개 / 실패: ${fail}개`);
    console.log(`   저장 위치: ${imgDir}`);
  }

  console.log("\n🎉 백업 완료!");
}

main().catch((e) => {
  console.error("❌ 백업 실패:", e);
  process.exit(1);
});
