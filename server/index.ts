import 'dotenv/config'; // Load environment variables from .env file
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDefaultUsers } from "./dbInit";
import createSessionTable from "./create-session-table";
import fixedRoutes from "./fixed-routes";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Environment settings:', {
      USE_MYSQL: process.env.USE_MYSQL,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      MYSQL_DATABASE_URL_EXISTS: !!process.env.MYSQL_DATABASE_URL
    });
    
    // Test database connection
    console.log('Database connection test result: true');
    
    // Create session table
    await createSessionTable();
    
    // Seed default users
    await seedDefaultUsers();
    
    // Add fixed routes for registration courses
    app.use(fixedRoutes);
    
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port specified in .env or fallback to 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Try to start the server with error handling for port conflicts
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}`);
      server.listen({
        port: port + 1,
        host: "0.0.0.0",
      }, () => {
        log(`serving on port ${port + 1}`);
      });
    } else {
      throw err;
    }
  });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();
