/**
 * OAuth provider 레지스트리.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ 새 provider 추가 방법                                        │
 * │ 1) 이 파일의 `oauthProviders` 배열에 항목 추가               │
 * │ 2) src/components/auth/ProviderIcons.tsx 에 동일 id 로 아이콘│
 * │    추가 (TypeScript 가 누락 시 타입 에러로 알려줌)           │
 * │ 3) 환경변수 설정: NextAuth 가 AUTH_<ID>_ID / _SECRET 를 자동 │
 * │    으로 읽음 (예: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)        │
 * └──────────────────────────────────────────────────────────────┘
 *
 * 이 파일은 JSX 를 포함하지 않아 server/client 양쪽에서 import 가능.
 * UI 레이어는 id/label 만 읽고 아이콘은 ProviderIcons 의 Record 로 매핑.
 */
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const oauthProviders = [
  { id: "google", label: "Google", nextAuth: Google },
  { id: "github", label: "GitHub", nextAuth: GitHub },
] as const;

export type OAuthProviderId = (typeof oauthProviders)[number]["id"];

// NextAuth 설정에서 바로 쓸 수 있는 provider 인스턴스 목록.
export const nextAuthProviders = oauthProviders.map((p) => p.nextAuth);

// UI 에서 순회할 id/label 만 추린 공개 메타데이터.
export const oauthProviderMeta: ReadonlyArray<{
  id: OAuthProviderId;
  label: string;
}> = oauthProviders.map(({ id, label }) => ({ id, label }));
