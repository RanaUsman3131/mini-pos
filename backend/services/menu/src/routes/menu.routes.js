import express from "express";
import * as controller from "../controllers/menu.controller.js";

const router = express.Router();

// Menus CRUD
router.post("/", controller.createMenu);
router.get("/", controller.getMenus);
router.get("/:id", controller.getMenu);
router.put("/:id", controller.updateMenu);
router.delete("/:id", controller.deleteMenu);

export default router;
