import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import profileRoutes from "./routes/profile";
import statesRoutes from "./routes/states";
import businessesRoutes from "./routes/businesses";
import lookupRoutes from "./routes/lookup";
import productsRoutes from "./routes/products";
import applicationsRoutes from "./routes/applications";
import dashboardRoutes from "./routes/dashboard";
import operatorDashboardRoutes from "./routes/operator-dashboard";
import membersRoutes from "./routes/members";

const app = express();

// Get CORS origins from environment
const getCorsOrigins = () => {
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim());
  }
  // Default origins for development
  return [
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://myngo.0o0.my",
    "https://api-myngo.0o0.my"
  ];
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
    exposedHeaders: ["X-New-Access-Token"], // Expose our custom header to client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes (with /api prefix for better organization)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/states", statesRoutes);
app.use("/api/businesses", businessesRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/operator-dashboard", operatorDashboardRoutes);
app.use("/api/members", membersRoutes);

// Legacy routes without /api prefix for backward compatibility
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/states", statesRoutes);
app.use("/businesses", businessesRoutes);
app.use("/lookup", lookupRoutes);
app.use("/products", productsRoutes);
app.use("/applications", applicationsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/operator-dashboard", operatorDashboardRoutes);
app.use("/members", membersRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "myNGO API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    docs: "/api"
  });
});

export default app;
