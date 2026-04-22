"use client";

import { signIn } from "next-auth/react";
import { oauthProviderMeta } from "@/lib/auth/providers";
import { providerIcons } from "./ProviderIcons";

type SignInButtonsProps = {
  /** 로그인 성공 후 돌아올 경로. 생략 시 NextAuth 기본값. */
  callbackUrl?: string;
  /** 버튼 위에 노출할 안내 문구. */
  message?: string;
};

/**
 * OAuth 로그인 버튼 묶음. `oauthProviderMeta` 를 순회해 자동으로 모든
 * provider 버튼을 렌더하므로, 새 provider 추가 시 여기서 수정할 일이 없다.
 */
export default function SignInButtons({
  callbackUrl,
  message = "계정으로 로그인하세요",
}: SignInButtonsProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
      <p className="text-sm text-[var(--muted)] mb-4">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {oauthProviderMeta.map(({ id, label }) => {
          const Icon = providerIcons[id];
          return (
            <button
              key={id}
              onClick={() => signIn(id, callbackUrl ? { callbackUrl } : undefined)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white dark:bg-[#1e2a3a] border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors shadow-sm"
            >
              <Icon />
              {label}로 로그인
            </button>
          );
        })}
      </div>
    </div>
  );
}
