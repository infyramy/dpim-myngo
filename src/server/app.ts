import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import statesRoutes from "./routes/states";
import businessesRoutes from "./routes/businesses";
import lookupRoutes from "./routes/lookup";
import productsRoutes from "./routes/products";
import applicationsRoutes from "./routes/applications";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    exposedHeaders: ["X-New-Access-Token"], // Expose our custom header to client
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check (both with and without /api prefix for compatibility)
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes with /api prefix
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/states", statesRoutes);
app.use("/api/businesses", businessesRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/applications", applicationsRoutes);

// API Health check endpoint for Docker/nginx
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
