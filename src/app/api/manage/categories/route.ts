import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({ category: posts.category })
    .from(posts);

  const categories = [...new Set(rows.map((r) => r.category))].sort();

  return NextResponse.json({ categories });
}
