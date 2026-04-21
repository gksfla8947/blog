import { NextRequest, NextResponse } from "next/server";
import { redis, postViewKey } from "@/lib/redis";

type Params = { params: Promise<{ slug: string }> };

// GET  /api/posts/[slug]/views — 현재 조회수 반환
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const views = await redis.get<number>(postViewKey(slug));
  return NextResponse.json({ views: views ?? 0 });
}

// POST /api/posts/[slug]/views — 조회수 1 증가 후 반환
export async function POST(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const views = await redis.incr(postViewKey(slug));
  return NextResponse.json({ views });
}
