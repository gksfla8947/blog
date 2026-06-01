/**
 * Neon HTTP 쿼리의 일시적(transient) 실패를 자동 재시도하는 헬퍼.
 *
 * Neon serverless 는 컨트롤 플레인이 잠깐 흔들리거나 브랜치가 슬립에서
 * 깨어나는 동안 5xx 를 흘릴 때가 있고, 그런 응답에는 페이로드에
 * `"neon:retryable": true` 플래그를 함께 실어 보낸다.
 *
 * Drizzle + neon-http 는 별도 재시도 정책이 없어 그대로 throw 하므로,
 * 사용자에게 노출되기 전에 짧은 지수 백오프로 다시 시도해 흡수한다.
 *
 * 영구적(authentication, schema 오류 등)인 실패는 retryable 신호가 없어
 * 즉시 throw 되므로 무한 루프 위험은 없다.
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 150;

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;

  // 1) Neon 이 명시한 retryable 플래그 (가장 신뢰도 높음).
  if (e["neon:retryable"] === true) return true;
  if (e.sourceError?.["neon:retryable"] === true) return true;
  if (e.cause?.["neon:retryable"] === true) return true;
  if (e.cause?.sourceError?.["neon:retryable"] === true) return true;

  // 2) 메시지 기반 fallback (드라이버 버전이 플래그를 누락한 경우 대비).
  const messages = [
    e.message,
    e.cause?.message,
    e.sourceError?.message,
  ].filter((m): m is string => typeof m === "string");

  return messages.some((msg) =>
    msg.includes("Control plane request failed") ||
    msg.includes("fetch failed") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    /HTTP status 5\d\d/.test(msg),
  );
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err) || attempt === maxAttempts - 1) throw err;
      // Exponential backoff with jitter: 150ms, 300ms, 600ms (+0~100ms 랜덤).
      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // 도달 불가 (위 루프에서 return 또는 throw 함) — 타입체커 안심용.
  throw lastErr;
}
