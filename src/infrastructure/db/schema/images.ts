import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const images = pgTable(
  "images",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled"),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    slug: text("slug").notNull().unique(),
    width: integer("width"),
    height: integer("height"),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("images_userId_idx").on(table.userId),
    uniqueIndex("images_slug_idx").on(table.slug),
  ],
);

export const imageRelations = relations(images, ({ one }) => ({
  user: one(user, {
    fields: [images.userId],
    references: [user.id],
  }),
}));

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
