import { kv } from "@vercel/kv";

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
      kv.incr(todayKey),
      kv.incr("visitors:total"),
    ]);

    // Set TTL for daily key (48 hours) so old keys auto-cleanup
    await kv.expire(todayKey, 60 * 60 * 48);

    return Response.json({ today, total });
  } catch {
    // KV not configured yet — return zeros
    return Response.json({ today: 0, total: 0 });
  }
}

export async function GET() {
  try {
    const todayKey = getTodayKey();

    const [today, total] = await Promise.all([
      kv.get<number>(todayKey),
      kv.get<number>("visitors:total"),
    ]);

    return Response.json({ today: today ?? 0, total: total ?? 0 });
  } catch {
    return Response.json({ today: 0, total: 0 });
  }
}
