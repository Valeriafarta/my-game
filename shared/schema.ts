import { pgTable, text, integer, timestamp, boolean, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  language: text("language").notNull().default("ru"),
  currency: text("currency").notNull().default("RUB"),
  targetAmount: integer("target_amount").notNull().default(1378),
  startingAmount: integer("starting_amount").notNull().default(50),
  genre: text("genre").notNull().default("drama"),
  reminderDay: text("reminder_day").notNull().default("monday"),
});

export const weeklyProgress = pgTable("weekly_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  weekNumber: integer("week_number").notNull(),
  amount: integer("amount").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  title: true,
  imageUrl: true,
  language: true,
  currency: true,
  targetAmount: true,
  startingAmount: true,
  genre: true,
  reminderDay: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertWeeklyProgressSchema = createInsertSchema(weeklyProgress).pick({
  goalId: true,
  weekNumber: true,
  amount: true,
}).extend({
  isCompleted: z.boolean().optional(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertWeeklyProgress = z.infer<typeof insertWeeklyProgressSchema>;
export type WeeklyProgress = typeof weeklyProgress.$inferSelect;

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;