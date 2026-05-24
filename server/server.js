import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import bookRoutes from "./routes/bookRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { isMongoConnected, localBooks } from "./utils/localDb.js";
import Book from "./models/Book.js";

dotenv.config();

const startServer = async () => {
  const app = express();
  const PORT = 3000; // Hardcoded container port constraint

  // Connect Database
  await connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // API Routes
  app.use("/api/books", bookRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/borrow", borrowRoutes);
  app.use("/api/ai", aiRoutes);

  // Auto-seed if database is empty (local or MongoDB)
  try {
    let shouldSeed = false;
    if (!isMongoConnected()) {
      shouldSeed = localBooks.get().length === 0;
    } else {
      const count = await Book.countDocuments();
      shouldSeed = count === 0;
    }

    if (shouldSeed) {
      console.log("No data found. Automatically executing catalog database seed...");
      // Dynamically import seed script to run it in-process without spawning shell logs
      await import("./seed.js");
    }
  } catch (seedErr) {
    console.error("Auto-seeding check failed:", seedErr.message);
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Integrating Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at: http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
});
