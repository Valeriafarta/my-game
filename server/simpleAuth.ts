import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function setupSimpleAuth(app: Express) {
  // Simple login endpoint that creates a mock user for development
  app.get("/api/login", (req, res) => {
    console.log('Simple login attempt');
    
    // Create a mock user session for development
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      firstName: 'Разработчик',
      lastName: 'Тестовый',
      profileImageUrl: null
    };
    
    // Store user in session
    req.session.userId = mockUser.id;
    req.session.user = mockUser;
    
    console.log('Mock user logged in:', mockUser);
    res.redirect('/');
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('Auth check - Session userId:', req.session.userId);
  
  if (!req.session.userId) {
    console.log('No userId in session');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Get user from session
  const user = req.session.user;
  if (!user) {
    console.log('No user in session');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log('User authenticated:', user.id);
  next();
};