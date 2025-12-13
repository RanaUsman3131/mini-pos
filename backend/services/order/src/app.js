import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/orders", orderRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order" });
});

export default app;
