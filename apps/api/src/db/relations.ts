import { relations } from "drizzle-orm";
import { user, session, account } from "./schema/auth.js";
import { categories } from "./schema/categories.js";
import { transactions } from "./schema/transactions.js";
import { attachments } from "./schema/attachments.js";

// User relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  categories: many(categories),
  transactions: many(transactions),
}));

// Session relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Account relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// Category relations
export const categoryRelations = relations(categories, ({ one, many }) => ({
  user: one(user, { fields: [categories.userId], references: [user.id] }),
  transactions: many(transactions),
}));

// Transaction relations
export const transactionRelations = relations(transactions, ({ one, many }) => ({
  user: one(user, { fields: [transactions.userId], references: [user.id] }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  attachments: many(attachments),
}));

// Attachment relations
export const attachmentRelations = relations(attachments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [attachments.transactionId],
    references: [transactions.id],
  }),
}));
