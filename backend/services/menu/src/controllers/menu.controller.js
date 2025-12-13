import * as repo from "../repositories/menu.repo.js";
import { publishEvent } from "../events/event.publisher.js";
import { EVENTS } from "../constants/eventTypes.js";

export const createMenu = async (req, res) => {
  const item = await repo.createMenuItem(req.body);
  await publishEvent(EVENTS.MENU_CREATED, item);
  res.status(201).json(item);
};

export const getMenus = async (_, res) => {
  const items = await repo.getAllMenuItems();
  res.json(items);
};

export const getMenu = async (req, res) => {
  const item = await repo.getMenuItemById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

export const updateMenu = async (req, res) => {
  await repo.updateMenuItem(req.params.id, req.body);
  await publishEvent(EVENTS.MENU_UPDATED, { id: req.params.id });
  res.json({ message: "Updated" });
};

export const deleteMenu = async (req, res) => {
  await repo.deleteMenuItem(req.params.id);
  await publishEvent(EVENTS.MENU_DELETED, { id: req.params.id });
  res.json({ message: "Deleted" });
};
