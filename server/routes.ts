import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupDevAuth, isDevAuthenticated } from "./devAuth";

// Declare module augmentation for express-session
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}
import { insertGoalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupDevAuth(app);

  // Auth routes
  app.get('/api/auth/user', isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile endpoint
  app.patch("/api/profile", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { name } = req.body;
      
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: "Name is required and must be at least 2 characters" });
      }

      const updatedUser = await storage.updateUserProfile(userId, { displayName: name.trim() });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Goals routes (with proper user isolation)
  app.get("/api/goals", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const userId = (req.user as any)?.claims?.sub;
      const goal = await storage.createGoal(validatedData, userId);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  // Weekly progress routes
  app.get("/api/goals/:id/progress", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.id);
      const progress = await storage.getWeeklyProgress(goalId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.patch("/api/goals/:goalId/progress/:weekNumber", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const weekNumber = parseInt(req.params.weekNumber);
      const { isCompleted } = req.body;
      
      const progress = await storage.updateWeeklyProgress(goalId, weekNumber, isCompleted);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
