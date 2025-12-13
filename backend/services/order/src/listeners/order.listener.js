import { updateOrder } from "../repositories/order.repo.js";
import { EVENTS } from "../constants/eventTypes.js";
import { consumeQueue, connectRabbitMQ } from "../config/rabbitmq.js";

const QUEUE_NAME = "order_service_queue";

export const setupOrderListeners = async () => {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Listen for ORDER_ENRICHED and ORDER_FAILED events
    await consumeQueue(
      QUEUE_NAME,
      [EVENTS.ORDER_ENRICHED, EVENTS.ORDER_FAILED],
      async (message, routingKey) => {
        if (routingKey === EVENTS.ORDER_ENRICHED) {
          await handleOrderEnriched(message);
        } else if (routingKey === EVENTS.ORDER_FAILED) {
          await handleOrderFailed(message);
        }
      }
    );

    console.log(`[LISTENER] Order Service listening for events`);
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

    console.log(`[ORDER] Order ${orderId} enriched and confirmed`);
  } catch (error) {
    console.error(`[ORDER] Failed to enrich order:`, error);
    throw error;
  }
};

export const handleOrderFailed = async (payload) => {
  try {
    const { orderId, reason } = payload;

    await updateOrder(orderId, {
      status: "FAILED",
      failureReason: reason,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[ORDER] Order ${orderId} failed: ${reason}`);
  } catch (error) {
    console.error(`[ORDER] Failed to update failed order:`, error);
    throw error;
  }
};

// Initialize listeners
setupOrderListeners();
