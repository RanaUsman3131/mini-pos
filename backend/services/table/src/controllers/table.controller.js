import * as repo from "../repositories/table.repo.js";
import { publishEvent } from "../events/event.publisher.js";
import { EVENTS } from "../constants/eventTypes.js";

export const createTable = async (req, res) => {
  const table = await repo.createTable(req.body);
  await publishEvent(EVENTS.TABLE_CREATED, table);
  res.status(201).json(table);
};

export const getTables = async (_, res) => {
  const items = await repo.getAllTables();
  res.json(items);
};

export const getTable = async (req, res) => {
  const item = await repo.getTableById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

export const updateTable = async (req, res) => {
  await repo.updateTable(req.params.id, req.body);
  await publishEvent(EVENTS.TABLE_UPDATED, { id: req.params.id });
  res.json({ message: "Updated" });
};

export const deleteTable = async (req, res) => {
  await repo.deleteTable(req.params.id);
  await publishEvent(EVENTS.TABLE_DELETED, { id: req.params.id });
  res.json({ message: "Deleted" });
};
