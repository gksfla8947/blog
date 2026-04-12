import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  bigint,
  index,
} from "drizzle-orm/pg-core";

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

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type BlobFile = typeof blobFiles.$inferSelect;
export type NewBlobFile = typeof blobFiles.$inferInsert;
