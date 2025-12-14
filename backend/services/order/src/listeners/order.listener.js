import { updateOrder, deleteOrder } from "../repositories/order.repo.js";
import { EVENTS } from "../constants/eventTypes.js";
import { consumeQueue, connectRabbitMQ } from "../config/rabbitmq.js";
import { publishEvent } from "../events/event.publisher.js";

const QUEUE_NAME = "order_service_queue";

export const setupOrderListeners = async () => {
  try {
    await connectRabbitMQ();

    await consumeQueue(
      QUEUE_NAME,
      [
        EVENTS.ORDER_ENRICHED,
        EVENTS.ORDER_FAILED,
        EVENTS.TABLE_OCCUPIED,
        EVENTS.TABLE_OCCUPY_FAILED,
      ],
      async (message, routingKey) => {
        if (routingKey === EVENTS.ORDER_ENRICHED) {
          await handleOrderEnriched(message);
        } else if (routingKey === EVENTS.ORDER_FAILED) {
          await handleOrderFailed(message);
        } else if (routingKey === EVENTS.TABLE_OCCUPIED) {
          await handleTableOccupied(message);
        } else if (routingKey === EVENTS.TABLE_OCCUPY_FAILED) {
          await handleTableOccupyFailed(message);
        }
      }
    );
  } catch (error) {
    console.error("[LISTENER] Failed to setup listeners:", error);
    // Retry connection after 5 seconds
    setTimeout(setupOrderListeners, 5000);
  }
};

export const handleOrderEnriched = async (payload) => {
  try {
    const { orderId, items, grandTotal } = payload;

    await updateOrder(orderId, {
      items,
      grandTotal,
      status: "CONFIRMED",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[ORDER] Failed to enrich order:`, error);
    throw error;
  }
};

export const handleOrderFailed = async (payload) => {
  try {
    const { orderId, reason } = payload;
    console.log(
      "Handling order failure for orderId:",
      orderId,
      "Reason:",
      reason
    );
    await updateOrder(orderId, {
      status: "FAILED",
      failureReason: reason,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const handleTableOccupied = async (payload) => {
  try {
    const { orderId, tableId, status } = payload;

    await updateOrder(orderId, {
      tableStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[ORDER] Failed to handle table occupied:`, error);
  }
};

export const handleTableOccupyFailed = async (payload) => {
  try {
    const { orderId, tableId, reason } = payload;

    await deleteOrder(orderId);

    await publishEvent(EVENTS.ORDER_FAILED, {
      orderId,
      reason: `Table occupation failed: ${reason}`,
    });
  } catch (error) {
    console.error(`[ORDER] Failed to handle table occupy failure:`, error);
  }
};

setupOrderListeners();
