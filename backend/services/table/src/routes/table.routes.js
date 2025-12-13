import express from "express";
import * as controller from "../controllers/table.controller.js";

const router = express.Router();

router.post("/", controller.createTable);
router.get("/", controller.getTables);
router.get("/:id", controller.getTable);
router.put("/:id", controller.updateTable);
router.delete("/:id", controller.deleteTable);

export default router;
