import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok", service: "TTP CRM API" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`conn at ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();

export default app;
