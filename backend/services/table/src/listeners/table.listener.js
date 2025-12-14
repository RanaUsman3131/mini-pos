import { subscribeToEvent, publishToQueue } from "../config/rabbitmq.js";
import * as repo from "../repositories/table.repo.js";

const EVENTS = {
  TABLE_OCCUPY_REQUESTED: "TABLE_OCCUPY_REQUESTED",
  TABLE_OCCUPIED: "TABLE_OCCUPIED",
  TABLE_OCCUPY_FAILED: "TABLE_OCCUPY_FAILED",
  TABLE_RELEASE_REQUESTED: "TABLE_RELEASE_REQUESTED",
  ORDER_FAILED: "ORDER_FAILED",
};

export const registerTableListeners = async () => {
  await subscribeToEvent(EVENTS.TABLE_OCCUPY_REQUESTED, async (payload) => {
    const { orderId, tableId, tableName } = payload;

    try {
      const table = await repo.getTableById(tableId);

      if (!table) {
        await publishToQueue(EVENTS.TABLE_OCCUPY_FAILED, {
          orderId,
          tableId,
          reason: "Table not found",
        });
        await publishToQueue(EVENTS.ORDER_FAILED, {
          orderId,
          reason: "Table not found",
        });
        return;
      }

      if (table.status === "occupied") {
        await publishToQueue(EVENTS.TABLE_OCCUPY_FAILED, {
          orderId,
          tableId,
          reason: "Table already occupied",
        });
        await publishToQueue(EVENTS.ORDER_FAILED, {
          orderId,
          reason: "Table already occupied",
        });
        return;
      }

      await repo.updateTable(tableId, { status: "occupied" });

      await publishToQueue(EVENTS.TABLE_OCCUPIED, {
        orderId,
        tableId,
        tableName,
        status: "occupied",
      });
    } catch (error) {
      await publishToQueue(EVENTS.TABLE_OCCUPY_FAILED, {
        orderId,
        tableId,
        reason: error.message,
      });
      await publishToQueue(EVENTS.ORDER_FAILED, {
        orderId,
        reason: `Table occupation failed: ${error.message}`,
      });
    }
  });

  await subscribeToEvent(EVENTS.TABLE_RELEASE_REQUESTED, async (payload) => {
    const { orderId, tableId } = payload;

    try {
      const table = await repo.getTableById(tableId);

      if (!table) {
        return;
      }

      await repo.updateTable(tableId, { status: "available" });
    } catch (error) {}
  });
};
