import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import crypto from "crypto";

// Simple token-based authentication with persistent tokens
const generatePersistentToken = (userId: string): string => {
  // Create a deterministic token based on userId that persists across restarts
  const secret = process.env.SESSION_SECRET || 'default-secret';
  return crypto.createHash('sha256').update(userId + secret).digest('hex');
};

const validateToken = (token: string): string | null => {
  // For development, accept any valid-looking token and return dev user
  if (token && token.length === 64) {
    return 'dev-user-123';
  }
  return null;
};

export function setupTokenAuth(app: Express) {
  // Token-based login endpoint
  app.get("/api/login", async (req, res) => {
    console.log('Token-based login attempt');
    
    try {
      // Create or get a development user
      const devUserId = 'dev-user-123';
      let user = await storage.getUser(devUserId);
      
      if (!user) {
        user = await storage.upsertUser({
          id: devUserId,
          email: 'dev@example.com',
          firstName: 'Тестовый',
          lastName: 'Пользователь',
          profileImageUrl: null
        });
        console.log('Created development user:', user);
      }
      
      // Generate a persistent token
      const token = generatePersistentToken(user.id);
      
      console.log('Generated token for user:', user.id);
      
      // Redirect with token as query parameter
      res.redirect(`/?token=${token}`);
    } catch (error) {
      console.error('Token login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Token validation endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token as string;
      
      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = validateToken(token);
      if (!userId) {
        console.log('Invalid token:', token);
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: "User not found" });
      }
      
      console.log('Token auth successful for user:', userId);
      res.json(user);
    } catch (error) {
      console.error("Token auth error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    // For development, just clear localStorage on client side
    res.redirect('/');
  });
}

export const isTokenAuthenticated: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token as string;
  
  if (!token) {
    console.log('No token in request');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const userId = validateToken(token);
  if (!userId) {
    console.log('Invalid token in auth check');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log('Token authentication successful:', userId);
  
  // Attach user to request for compatibility
  (req as any).user = { claims: { sub: userId } };
  next();
};