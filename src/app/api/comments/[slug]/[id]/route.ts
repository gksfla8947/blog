import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ slug: string; id: string }> };

// DELETE /api/comments/[slug]/[id] — 댓글 삭제 (본인만)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  // 본인 댓글인지 확인 후 삭제 (AND 조건으로 한 번에 처리)
  const deleted = await db
    .delete(comments)
    .where(and(eq(comments.id, id), eq(comments.userId, session.user.id)))
    .returning({ id: comments.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없거나 삭제 권한이 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
