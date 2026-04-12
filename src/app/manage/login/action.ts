"use server";

import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function login(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const valid = await verifyPassword(password);

  if (!valid) {
    return { success: false, error: "비밀번호가 올바르지 않습니다" };
  }

  const token = await signToken();
  await setAuthCookie(token);

  return { success: true };
}
