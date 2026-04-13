/**
 * 복구 스크립트
 *
 * 실행:  npx tsx scripts/restore.ts backups/backup-YYYY-MM-DD.json
 *
 * 옵션:
 *   --dry-run   실제 DB 변경 없이 결과만 미리 확인
 *   --overwrite 이미 있는 글도 덮어쓰기 (기본: 건너뜀)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const overwrite = args.includes("--overwrite");
const backupFile = args.find((a) => a.endsWith(".json"));

if (!backupFile) {
  console.error("❌ 백업 파일을 지정해주세요.");
  console.error("   예시: npx tsx scripts/restore.ts backups/backup-2026-04-13.json");
  process.exit(1);
}

interface BackupPayload {
  exportedAt: string;
  counts: { posts: number; blobs: number };
  posts: (typeof schema.posts.$inferSelect)[];
  blobs: (typeof schema.blobFiles.$inferSelect)[];
}

async function main() {
  const filePath = path.resolve(backupFile!);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일 없음: ${filePath}`);
    process.exit(1);
  }

  const payload: BackupPayload = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`📂 백업 파일: ${filePath}`);
  console.log(`   내보낸 시각: ${payload.exportedAt}`);
  console.log(`   글: ${payload.counts.posts}개 / Blob: ${payload.counts.blobs}개`);

  if (dryRun) {
    console.log("\n🔍 [dry-run 모드] DB 변경 없이 확인만 합니다.");
  }

  const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

  // 현재 DB의 slug 목록 조회
  const existing = await db.select({ id: schema.posts.id }).from(schema.posts);
  const existingIds = new Set(existing.map((r) => r.id));

  const toInsert = payload.posts.filter((p) => !existingIds.has(p.id));
  const toUpdate = payload.posts.filter((p) => existingIds.has(p.id));

  console.log(`\n📝 복구 계획:`);
  console.log(`   신규 삽입: ${toInsert.length}개`);
  console.log(
    `   이미 존재: ${toUpdate.length}개 ${overwrite ? "(--overwrite: 덮어씀)" : "(건너뜀)"}`
  );

  if (dryRun) {
    if (toInsert.length > 0) {
      console.log("\n  [신규 삽입 목록]");
      toInsert.forEach((p) => console.log(`   + ${p.id}: ${p.title}`));
    }
    if (toUpdate.length > 0 && overwrite) {
      console.log("\n  [덮어쓸 목록]");
      toUpdate.forEach((p) => console.log(`   ~ ${p.id}: ${p.title}`));
    }
    console.log("\n✅ dry-run 완료. 실제 적용하려면 --dry-run 플래그를 제거하세요.");
    return;
  }

  // 신규 삽입
  let inserted = 0;
  for (const post of toInsert) {
    await db.insert(schema.posts).values(post);
    console.log(`  ✓ 삽입: ${post.id}`);
    inserted++;
  }

  // 덮어쓰기
  let updated = 0;
  if (overwrite) {
    for (const post of toUpdate) {
      await db
        .insert(schema.posts)
        .values(post)
        .onConflictDoUpdate({
          target: schema.posts.id,
          set: {
            title: post.title,
            date: post.date,
            description: post.description,
            category: post.category,
            tags: post.tags,
            content: post.content,
            contentHtml: post.contentHtml,
            published: post.published,
            updatedAt: sql`now()`,
          },
        });
      console.log(`  ~ 업데이트: ${post.id}`);
      updated++;
    }
  }

  console.log(`\n🎉 복구 완료! 삽입 ${inserted}개 / 업데이트 ${updated}개`);

  if (toUpdate.length > 0 && !overwrite) {
    console.log(
      `\n⚠️  건너뛴 글 ${toUpdate.length}개를 덮어쓰려면 --overwrite 플래그를 추가하세요.`
    );
  }
}

main().catch((e) => {
  console.error("❌ 복구 실패:", e);
  process.exit(1);
});
