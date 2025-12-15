import {
  subscribeToTopic,
  connectPubSub,
  createTopicIfNotExists,
  createSubscriptionIfNotExists,
  publishToTopic,
} from "../config/pubsub.js";
import * as repo from "../repositories/table.repo.js";

const EVENTS = {
  TABLE_OCCUPY_REQUESTED: "TABLE_OCCUPY_REQUESTED",
  TABLE_OCCUPIED: "TABLE_OCCUPIED",
  TABLE_OCCUPY_FAILED: "TABLE_OCCUPY_FAILED",
  TABLE_RELEASE_REQUESTED: "TABLE_RELEASE_REQUESTED",
  ORDER_FAILED: "ORDER_FAILED",
};

const TOPIC_NAME = "mini-pos-events";
const SUBSCRIPTION_NAME = "table-service-subscription";

export const registerTableListeners = async () => {
  try {
    await connectPubSub();
    await createTopicIfNotExists(TOPIC_NAME);
    await createSubscriptionIfNotExists(TOPIC_NAME, SUBSCRIPTION_NAME);

    await subscribeToTopic(SUBSCRIPTION_NAME, async (payload, eventType) => {
      if (eventType === EVENTS.TABLE_OCCUPY_REQUESTED) {
        await handleTableOccupyRequested(payload);
      } else if (eventType === EVENTS.TABLE_RELEASE_REQUESTED) {
        await handleTableReleaseRequested(payload);
      }
    });

    console.log("[TABLE] Listeners setup complete");
  } catch (error) {
    console.error("[LISTENER] Failed to setup listeners:", error);
    setTimeout(registerTableListeners, 5000);
  }
};

const handleTableOccupyRequested = async (payload) => {
  const { orderId, tableId, tableName } = payload;

  try {
    const table = await repo.getTableById(tableId);

    if (!table) {
      await publishToTopic(TOPIC_NAME, {
        event: EVENTS.TABLE_OCCUPY_FAILED,
        orderId,
        tableId,
        reason: "Table not found",
      });
      await publishToTopic(TOPIC_NAME, {
        event: EVENTS.ORDER_FAILED,
        orderId,
        reason: "Table not found",
      });
      return;
    }

    if (table.status === "occupied") {
      await publishToTopic(TOPIC_NAME, {
        event: EVENTS.TABLE_OCCUPY_FAILED,
        orderId,
        tableId,
        reason: "Table already occupied",
      });
      await publishToTopic(TOPIC_NAME, {
        event: EVENTS.ORDER_FAILED,
        orderId,
        reason: "Table already occupied",
      });
      return;
    }

    await repo.updateTable(tableId, { status: "occupied" });

    await publishToTopic(TOPIC_NAME, {
      event: EVENTS.TABLE_OCCUPIED,
      orderId,
      tableId,
      tableName,
      status: "occupied",
    });
  } catch (error) {
    await publishToTopic(TOPIC_NAME, {
      event: EVENTS.TABLE_OCCUPY_FAILED,
      orderId,
      tableId,
      reason: error.message,
    });
    await publishToTopic(TOPIC_NAME, {
      event: EVENTS.ORDER_FAILED,
      orderId,
      reason: `Table occupation failed: ${error.message}`,
    });
  }
};

const handleTableReleaseRequested = async (payload) => {
  const { orderId, tableId } = payload;

  try {
    const table = await repo.getTableById(tableId);

    if (!table) {
      return;
    }

    await repo.updateTable(tableId, { status: "available" });
  } catch (error) {
    console.error("[TABLE] Error releasing table:", error);
  }
};
