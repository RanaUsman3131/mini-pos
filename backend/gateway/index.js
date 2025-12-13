import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";

const app = express();

const corsOptions = {
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gateway is Working");
});

const proxyOptions = {
  proxyReqPathResolver: (req) => req.originalUrl,
  proxyErrorHandler: (err, res, next) => {
    console.error("Proxy error:", err.code);

    res.status(503).json({
      message: "Service temporarily unavailable",
      error: err.code || "SERVICE_DOWN",
    });
  },
};

app.use("/menus", proxy("http://localhost:8002", proxyOptions)); // Menu Service
app.use("/tables", proxy("http://localhost:8004", proxyOptions)); // Table Service
app.use("/orders", proxy("http://localhost:8005", proxyOptions)); // Orders Service

app.listen(8000, () => {
  console.log("Gateway is Listening to Port 8000");
});
