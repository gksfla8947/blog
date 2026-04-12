import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      category: posts.category,
      published: posts.published,
      date: posts.date,
    })
    .from(posts)
    .orderBy(desc(posts.date));

  return NextResponse.json({ posts: rows });
}
