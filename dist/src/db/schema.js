import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, varchar, } from "drizzle-orm/pg-core";
export const users = pgTable("user", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    role: varchar({ length: 20, enum: ["employee", "employer"] }).notNull(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    deleted: boolean().default(false).notNull(),
});
export const usersRelation = relations(users, ({ many }) => ({
    assignedTasks: many(tasks, { relationName: "assignedTasks" }),
    createdTasks: many(tasks, { relationName: "createdTasks" }),
}));
export const sessions = pgTable("session", {
    id: text().primaryKey(),
    userId: integer()
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
});
export const tasks = pgTable("task", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    status: varchar({
        length: 20,
        enum: ["todo", "in-progress", "done", "pending"],
    })
        .default("todo")
        .notNull(),
    assigneeId: integer().references(() => users.id),
    createdById: integer().references(() => users.id),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    dueDate: timestamp({ withTimezone: true }).notNull(),
});
export const tasksRelation = relations(tasks, ({ one }) => ({
    assignee: one(users, {
        fields: [tasks.assigneeId],
        references: [users.id],
        relationName: "assignedTasks",
    }),
    createdBy: one(users, {
        fields: [tasks.createdById],
        references: [users.id],
        relationName: "createdTasks",
    }),
}));
