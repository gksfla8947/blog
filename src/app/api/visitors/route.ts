import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `visitors:${yyyy}-${mm}-${dd}`;
}

export async function POST() {
  try {
    const todayKey = getTodayKey();

    const [today, total] = await Promise.all([
      redis.incr(todayKey),
      redis.incr("visitors:total"),
    ]);

    // Set TTL for daily key (48 hours) so old keys auto-cleanup
    await redis.expire(todayKey, 60 * 60 * 48);

    return Response.json({ today, total });
  } catch {
    return Response.json({ today: 0, total: 0 });
  }
}

export async function GET() {
  try {
    const todayKey = getTodayKey();

    const [today, total] = await Promise.all([
      redis.get<number>(todayKey),
      redis.get<number>("visitors:total"),
    ]);

    return Response.json({ today: today ?? 0, total: total ?? 0 });
  } catch {
    return Response.json({ today: 0, total: 0 });
  }
}
