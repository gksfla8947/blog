import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { blobFiles, posts } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const postSlug = formData.get("postSlug") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 클립보드 이미지는 name이 "" 이거나 확장자 없는 경우가 많으므로
  // MIME 타입을 우선 기준으로 확장자를 결정
  const MIME_TO_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/tiff": "tiff",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  const nameParts = file.name.split(".");
  const extFromName = nameParts.length > 1 ? nameParts.pop()! : "";
  const ext = extFromName || MIME_TO_EXT[file.type] || "bin";

  // MIME 타입이 없는 경우 확장자로 추론
  const contentType = file.type || `image/${ext}`;

  const pathname = `devs-vltra/${postSlug ?? "uploads"}/${randomUUID()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType,
  });

  // postSlug FK 검증: 아직 저장되지 않은 새 글 작성 중일 수 있으므로
  // posts 테이블에 실제로 존재하는 경우에만 FK로 연결, 없으면 null
  let resolvedPostSlug: string | null = null;
  if (postSlug) {
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postSlug))
      .limit(1);
    resolvedPostSlug = existing.length > 0 ? postSlug : null;
  }

  await db.insert(blobFiles).values({
    id: randomUUID(),
    url: blob.url,
    pathname: blob.pathname,
    size: file.size,
    contentType: contentType,
    postSlug: resolvedPostSlug,
  });

  return NextResponse.json({ url: blob.url });
}
