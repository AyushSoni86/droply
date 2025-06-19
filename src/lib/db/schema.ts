import {
  integer,
  pgTable,
  boolean,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the "files" table schema
export const files = pgTable("files", {
  // Unique ID for each file/folder, automatically generated
  id: uuid("id").defaultRandom().primaryKey(),

  // File-specific information
  name: text("name").notNull(), // Name of the file or folder
  path: text("path").notNull(), // File path (e.g., "/documents/report.pdf")
  size: integer("size").notNull(), // Size in bytes
  type: text("type").notNull(), // MIME type (e.g., "image/png", "folder")

  // URLs for accessing the file and its thumbnail (if any)
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // Optional thumbnail image URL

  // Ownership and hierarchy
  userId: uuid("user_id").notNull(), // ID of the user who owns this file/folder
  parentId: uuid("parent_id"), // Optional ID of the parent folder (null if root-level)

  // Tags or flags for organizing files
  isFolder: boolean("is_folder").default(false).notNull(), // True if it's a folder
  isStarred: boolean("is_starred").default(false).notNull(), // True if marked as favorite
  isTrash: boolean("is_trash").default(false).notNull(), // True if moved to trash

  // Timestamps for tracking creation and last update
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define self-relations in the "files" table
export const filesRelations = relations(files, ({ one, many }) => ({
  // Each file/folder can optionally have ONE parent folder (self-relation)
  parent: one(files, {
    fields: [files.parentId], // This file's parent ID
    references: [files.id], // Should match the ID of another record in the same table
  }),

  // Each folder can have MANY child files/folders (self-relation)
  children: many(files), // Inverse of the parent relationship
}));

export const File = typeof files.$inferSelect; // Type for selecting files
export const FileInsert = typeof files.$inferInsert; // Type for inserting new files
