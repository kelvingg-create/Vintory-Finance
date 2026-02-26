import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // Material icon name (e.g., "payments", "shopping_cart")
  color: text("color"), // Color identifier (e.g., "emerald", "rose", "blue")
  type: categoryTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
