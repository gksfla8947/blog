import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { blobFiles } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";

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

  const ext = file.name.split(".").pop() ?? "bin";
  const pathname = `blog/${postSlug ?? "uploads"}/${randomUUID()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  // Record in DB (CDC pattern — no list() needed)
  await db.insert(blobFiles).values({
    id: randomUUID(),
    url: blob.url,
    pathname: blob.pathname,
    size: file.size,
    contentType: file.type,
    postSlug: postSlug ?? null,
  });

  return NextResponse.json({ url: blob.url });
}
