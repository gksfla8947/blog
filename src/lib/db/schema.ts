import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  bigint,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(), // slug
  title: text("title").notNull(),
  date: timestamp("date", { mode: "string" }).notNull(),
  description: text("description"),
  category: text("category").notNull().default("일반"),
  tags: text("tags").array(),
  content: jsonb("content").notNull(), // BlockNote JSON
  contentHtml: text("content_html"), // pre-rendered HTML
  published: boolean("published").default(false),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const blobFiles = pgTable(
  "blob_files",
  {
    id: text("id").primaryKey(),
    url: text("url").notNull().unique(),
    pathname: text("pathname").notNull(),
    size: bigint("size", { mode: "number" }),
    contentType: text("content_type"),
    postSlug: text("post_slug").references(() => posts.id, {
      onDelete: "set null",
    }),
    uploadedAt: timestamp("uploaded_at", { mode: "string" }).defaultNow(),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("blob_files_pathname_idx").on(table.pathname),
    index("blob_files_post_slug_idx").on(table.postSlug),
    index("blob_files_is_deleted_idx").on(table.isDeleted),
  ]
);

// ─── Auth.js 테이블 ───────────────────────────────────────────────────────────

export const authUsers = pgTable("auth_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

// ─── 댓글 테이블 ──────────────────────────────────────────────────────────────

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postSlug: text("post_slug")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("comments_post_slug_idx").on(table.postSlug),
    index("comments_user_id_idx").on(table.userId),
  ]
);

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type BlobFile = typeof blobFiles.$inferSelect;
export type NewBlobFile = typeof blobFiles.$inferInsert;
export type AuthUser = typeof authUsers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
