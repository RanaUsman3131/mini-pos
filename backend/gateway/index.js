import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import dotenv from "dotenv";

dotenv.config();

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

app.use("/menus", proxy(process.env.MENU_SERVICE_URL, proxyOptions)); // Menu Service
app.use("/tables", proxy(process.env.TABLE_SERVICE_URL, proxyOptions)); // Table Service
app.use("/orders", proxy(process.env.ORDER_SERVICE_URL, proxyOptions)); // Orders Service

app.listen(process.env.PORT || 8005, () => {
  console.log(`Gateway is Listening to Port ${process.env.PORT || 8005}`);
});
