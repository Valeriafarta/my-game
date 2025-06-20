import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Development authentication system
export function setupDevAuth(app: Express) {
  // Development login endpoint
  app.get("/api/login", async (req, res) => {
    console.log('Development login attempt');
    
    try {
      // Create or get a development user
      const devUserId = 'dev-user-123';
      let user = await storage.getUser(devUserId);
      
      if (!user) {
        // Create development user
        user = await storage.upsertUser({
          id: devUserId,
          email: 'dev@example.com',
          firstName: 'Тестовый',
          lastName: 'Пользователь',
          profileImageUrl: null
        });
        console.log('Created development user:', user);
      }
      
      // Generate a simple auth token
      const authToken = `dev-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Send HTML page that sets localStorage and redirects
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Вход в систему...</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: #0c0c0c; 
                color: white; 
              }
              .loader { 
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #E50914; 
                border-radius: 50%; 
                width: 40px; 
                height: 40px; 
                animation: spin 1s linear infinite; 
                margin: 20px auto; 
              }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="loader"></div>
            <h2>Вход в систему...</h2>
            <p>Подождите, идет авторизация...</p>
            <script>
              // Store auth token and user data
              localStorage.setItem('authToken', '${authToken}');
              localStorage.setItem('userData', JSON.stringify(${JSON.stringify(user)}));
              
              // Redirect after a short delay
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Development login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Выход из системы...</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #0c0c0c; 
              color: white; 
            }
          </style>
        </head>
        <body>
          <h2>Выход из системы...</h2>
          <script>
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Redirect immediately
            window.location.href = '/';
          </script>
        </body>
      </html>
    `);
  });
}

export const isDevAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || req.query.token as string;
  
  console.log('Auth check - Token:', token ? 'Present' : 'Missing');
  
  if (!token || !token.includes('dev-token')) {
    console.log('No valid token - unauthorized');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // For development, always authenticate as dev user
  const devUserId = 'dev-user-123';
  
  try {
    let user = await storage.getUser(devUserId);
    if (!user) {
      console.log('Dev user not found, creating...');
      // Create development user if not exists
      user = await storage.upsertUser({
        id: devUserId,
        email: 'dev@example.com',
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        profileImageUrl: null
      });
      console.log('Created dev user:', user);
    }
    
    console.log('User authenticated successfully:', devUserId);
    
    // Attach user to request for compatibility
    (req as any).user = { claims: { sub: devUserId } };
    next();
  } catch (error) {
    console.error('Error with user authentication:', error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};