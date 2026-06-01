/**
 * Neon HTTP 쿼리의 일시적(transient) 실패를 자동 재시도하는 헬퍼.
 *
 * Neon serverless 는 컨트롤 플레인이 잠깐 흔들리거나 브랜치가 슬립에서
 * 깨어나는 동안 5xx 를 흘릴 때가 있고, 그런 응답에는 페이로드에
 * `"neon:retryable": true` 플래그를 함께 실어 보낸다. 더 나쁜 경우에는
 * 응답 자체가 오지 않고 fetch 가 그대로 매달려 있는 경우도 있어
 * (Vercel SSG 빌드의 페이지당 60초 한도를 초과시켜 빌드 실패 유발),
 * 시도마다 별도의 타임아웃을 걸어 hang 도 retry 대상으로 만든다.
 *
 * 영구적(authentication, schema 오류 등)인 실패는 retryable 신호가 없어
 * 첫 시도에서 즉시 throw 되므로 무한 루프 위험은 없다.
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_ATTEMPT_TIMEOUT_MS = 8_000;
const BASE_DELAY_MS = 150;

const TIMEOUT_TAG = "__withDbRetry_timeout__";

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;

  // 0) 자체 발생 타임아웃은 항상 retryable.
  if (e[TIMEOUT_TAG] === true) return true;

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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`DB query timeout after ${ms}ms`) as Error & {
        [TIMEOUT_TAG]: true;
      };
      err[TIMEOUT_TAG] = true;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export interface WithDbRetryOptions {
  maxAttempts?: number;
  /** 각 시도가 이 시간 초과로 응답 없으면 강제 reject 후 재시도. */
  attemptTimeoutMs?: number;
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: WithDbRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const attemptTimeoutMs = options.attemptTimeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS;

  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await withTimeout(fn(), attemptTimeoutMs);
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
