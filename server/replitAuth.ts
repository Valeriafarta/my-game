import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      console.log('Loading OIDC config with:', {
        issuer: process.env.ISSUER_URL ?? "https://replit.com/oidc",
        client_id: process.env.REPL_ID
      });
      
      const config = await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
      console.log('OIDC config loaded successfully');
      return config;
    } catch (error) {
      console.error('OIDC config error:', error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // Convert to seconds for pg store
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: true, // Save session back to store
    saveUninitialized: true,
    rolling: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: false, // Allow for development
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    console.log('Verify callback - received tokens:', !!tokens.access_token);
    console.log('Verify callback - claims:', tokens.claims());
    
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    
    console.log('Verify callback - user created:', user);
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    console.log(`Registering strategy for domain: ${domain}`);
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`Strategy registered: replitauth:${domain}`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`Login attempt for hostname: ${req.hostname}`);
    console.log(`Attempting authentication with strategy: ${strategyName}`);
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`Callback received for hostname: ${req.hostname}`);
    console.log('Session ID:', req.sessionID);
    console.log('Query params:', req.query);
    
    passport.authenticate(strategyName, (err: any, user: any, info: any) => {
      console.log('Callback auth - err:', err);
      console.log('Callback auth - user:', user);
      console.log('Callback auth - info:', info);
      
      if (err) {
        console.error('Callback authentication error:', err);
        return res.redirect('/api/login');
      }
      
      if (!user) {
        console.error('No user returned in callback');
        return res.redirect('/api/login');
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Callback login error:', loginErr);
          return res.redirect('/api/login');
        }
        
        console.log('User logged in successfully via callback');
        res.redirect('/');
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('Auth check - Session:', req.session);
  console.log('Auth check - User:', req.user);
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  
  const user = req.user as any;

  if (!req.isAuthenticated() || !user) {
    console.log('Auth failed - not authenticated or no user');
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!user.expires_at) {
    console.log('Auth failed - no expires_at');
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  console.log('Token expiry check:', { now, expires_at: user.expires_at });
  
  if (now <= user.expires_at) {
    console.log('Token still valid, proceeding');
    return next();
  }

  console.log('Token expired, attempting refresh');
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log('No refresh token available');
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log('Token refreshed successfully');
    return next();
  } catch (error) {
    console.log('Token refresh failed:', error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};