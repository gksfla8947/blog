import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { authUsers, authAccounts } from "@/lib/db/schema";
import { nextAuthProviders } from "@/lib/auth/providers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
  }),
  providers: nextAuthProviders,
  session: { strategy: "jwt" },
  callbacks: {
    // JWT에 사용자 DB id 포함
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // 세션에 사용자 id 노출
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    // 커스텀 에러 페이지 대신 기본 Next Auth 에러 페이지 사용
    error: "/auth/error",
  },
});
