import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import sharedRoutes from "./routes/shared.js";
import insightRoutes from "./routes/insights.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/shared", sharedRoutes);
app.use("/insights", insightRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Peblo Notes API is running 🚀" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
