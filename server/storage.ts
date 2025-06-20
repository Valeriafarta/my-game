import { goals, weeklyProgress, users, type Goal, type InsertGoal, type WeeklyProgress, type InsertWeeklyProgress, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: { displayName: string }): Promise<User>;
  
  // Goals
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal, userId?: string): Promise<Goal>;
  getAllGoals(userId?: string): Promise<Goal[]>;
  getUserGoals(userId: string): Promise<Goal[]>;
  
  // Weekly Progress
  getWeeklyProgress(goalId: number): Promise<WeeklyProgress[]>;
  updateWeeklyProgress(goalId: number, weekNumber: number, isCompleted: boolean): Promise<WeeklyProgress>;
  createWeeklyProgress(progress: InsertWeeklyProgress): Promise<WeeklyProgress>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: { displayName: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        displayName: updates.displayName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(insertGoal: InsertGoal, userId?: string): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...insertGoal,
        userId: userId || null
      })
      .returning();
    
    // Create initial weekly progress entries with amounts that total to targetAmount
    const progressEntries = [];
    const targetAmount = goal.targetAmount || 1378;
    
    // Calculate weekly amounts using progressive formula
    // Formula: amount = baseAmount * week, where baseAmount is calculated to reach target
    const totalWeeks = 52;
    const sumOfWeeks = (totalWeeks * (totalWeeks + 1)) / 2; // Sum of 1+2+3+...+52 = 1378
    const baseAmount = Math.round(targetAmount / sumOfWeeks);
    
    let actualTotal = 0;
    for (let week = 1; week <= 52; week++) {
      let weekAmount = baseAmount * week;
      
      // Adjust the last week to match exact target amount, but ensure it's positive
      if (week === 52) {
        const remainingAmount = targetAmount - actualTotal;
        weekAmount = Math.max(remainingAmount, baseAmount); // Ensure it's never negative or too small
      }
      
      progressEntries.push({
        goalId: goal.id,
        weekNumber: week,
        amount: weekAmount,
        isCompleted: false
      });
      
      actualTotal += weekAmount;
    }
    
    await db.insert(weeklyProgress).values(progressEntries);
    
    return goal;
  }

  async getAllGoals(userId?: string): Promise<Goal[]> {
    if (userId) {
      return await db.select().from(goals).where(eq(goals.userId, userId));
    }
    return await db.select().from(goals);
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    const result = await db.select().from(goals).where(eq(goals.userId, userId));
    return result.sort((a, b) => b.id - a.id); // Sort by ID descending (newest first)
  }

  async getWeeklyProgress(goalId: number): Promise<WeeklyProgress[]> {
    return await db
      .select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.goalId, goalId))
      .orderBy(weeklyProgress.weekNumber);
  }

  async updateWeeklyProgress(goalId: number, weekNumber: number, isCompleted: boolean): Promise<WeeklyProgress> {
    const [updatedProgress] = await db
      .update(weeklyProgress)
      .set({ 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null 
      })
      .where(
        and(
          eq(weeklyProgress.goalId, goalId),
          eq(weeklyProgress.weekNumber, weekNumber)
        )
      )
      .returning();
    
    return updatedProgress;
  }

  async createWeeklyProgress(insertProgress: InsertWeeklyProgress): Promise<WeeklyProgress> {
    const [progress] = await db
      .insert(weeklyProgress)
      .values(insertProgress)
      .returning();
    
    return progress;
  }
}

export const storage = new DatabaseStorage();
