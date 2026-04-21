import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { comments, authUsers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

type Params = { params: Promise<{ slug: string }> };

// GET /api/comments/[slug] — 포스트의 댓글 목록 (공개)
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: authUsers.id,
        name: authUsers.name,
        image: authUsers.image,
      },
    })
    .from(comments)
    .innerJoin(authUsers, eq(comments.userId, authUsers.id))
    .where(eq(comments.postSlug, slug))
    .orderBy(desc(comments.createdAt));

  return NextResponse.json(rows);
}

// POST /api/comments/[slug] — 댓글 작성 (로그인 필요)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const content: unknown = body?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "댓글 내용을 입력해주세요" }, { status: 400 });
  }

  if (content.trim().length > 1000) {
    return NextResponse.json(
      { error: "댓글은 1000자 이하로 작성해주세요" },
      { status: 400 }
    );
  }

  const [comment] = await db
    .insert(comments)
    .values({
      postSlug: slug,
      userId: session.user.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json(comment, { status: 201 });
}
