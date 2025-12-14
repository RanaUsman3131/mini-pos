import { db } from "../firebase/firebase.js";
import { publishEvent } from "../events/event.publisher.js";
import { consumeQueue, connectRabbitMQ } from "../config/rabbitmq.js";

const ORDER_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_ENRICHED: "ORDER_ENRICHED",
  ORDER_FAILED: "ORDER_FAILED",
};

const QUEUE_NAME = "menu_service_queue";

export const setupMenuListeners = async () => {
  try {
    await connectRabbitMQ();

    await consumeQueue(
      QUEUE_NAME,
      [ORDER_EVENTS.ORDER_CREATED],
      async (message, routingKey) => {
        if (routingKey === ORDER_EVENTS.ORDER_CREATED) {
          await handleOrderCreated(message);
        }
      }
    );
  } catch (error) {
    console.error("[LISTENER] Failed to setup listeners:", error);
    // Retry connection after 5 seconds
    setTimeout(setupMenuListeners, 5000);
  }
};

export const handleOrderCreated = async (payload) => {
  try {
    const { orderId, tableId, items } = payload;

    const enrichedItems = [];
    let grandTotal = 0;

    await db.runTransaction(async (transaction) => {
      const menuCollection = db.collection("menu_items");

      for (const item of items) {
        const menuDocRef = menuCollection.doc(item.menuId);
        const menuDoc = await transaction.get(menuDocRef);

        if (!menuDoc.exists) {
          throw new Error(`Menu item ${item.menuId} not found`);
        }

        const menuData = menuDoc.data();

        if (menuData.remaining_stock < item.quantity) {
          throw new Error(
            `OUT_OF_STOCK: ${menuData.name} (requested: ${item.quantity}, available: ${menuData.remaining_stock})`
          );
        }

        const lineTotal = menuData.price * item.quantity;
        grandTotal += lineTotal;

        enrichedItems.push({
          menuId: item.menuId,
          menuName: menuData.name,
          price: menuData.price,
          quantity: item.quantity,
          lineTotal,
        });

        const newStock = menuData.remaining_stock - item.quantity;

        transaction.update(menuDocRef, { remaining_stock: newStock });
      }
    });

    await publishEvent(ORDER_EVENTS.ORDER_ENRICHED, {
      event: ORDER_EVENTS.ORDER_ENRICHED,
      orderId,
      items: enrichedItems,
      grandTotal,
    });
  } catch (error) {
    console.error(`[MENU] Failed to process order:`, error.message);

    // Emit ORDER_FAILED event
    await publishEvent(ORDER_EVENTS.ORDER_FAILED, {
      event: ORDER_EVENTS.ORDER_FAILED,
      orderId: payload.orderId,
      reason: error.message.includes("OUT_OF_STOCK")
        ? "OUT_OF_STOCK"
        : "VALIDATION_FAILED",
    });
  }
};

setupMenuListeners();
