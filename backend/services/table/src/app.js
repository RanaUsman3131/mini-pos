import express from "express";
import cors from "cors";
import tableRoutes from "./routes/table.routes.js";

const app = express();

const corsOptions = {
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/tables", tableRoutes);

app.get("/health", (_, res) => res.json({ status: "UP" }));

export default app;
