"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./action";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      router.push("/manage");
    } else {
      setError(result.error ?? "로그인 실패");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm p-8 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2 text-[var(--foreground)]">
          관리자 로그인
        </h1>
        <p className="text-sm text-[var(--muted)] text-center mb-6">
          비밀번호를 입력하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chrome 피싱 탐지 오작동 방지: 표준 username 필드 (hidden) */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue="admin"
            className="hidden"
            readOnly
            aria-hidden="true"
          />
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
