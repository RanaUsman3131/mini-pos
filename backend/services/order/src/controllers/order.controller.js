import * as repo from "../repositories/order.repo.js";
import { publishEvent } from "../events/event.publisher.js";
import { EVENTS } from "../constants/eventTypes.js";

export const createOrder = async (req, res) => {
  try {
    const { tableId, tableName, items } = req.body;

    if (!tableId) {
      return res.status(400).json({ error: "table Id is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }

    for (const item of items) {
      if (!item.menuId) {
        return res
          .status(400)
          .json({ error: "menuId is required for all items" });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res
          .status(400)
          .json({ error: "quantity must be greater than 0" });
      }
    }

    const order = await repo.createOrder({
      tableId,
      tableName,
      items: items.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
      })),
    });

    await publishEvent(EVENTS.TABLE_OCCUPY_REQUESTED, {
      orderId: order.id,
      tableId: order.tableId,
      tableName: order.tableName,
    });

    await publishEvent(EVENTS.ORDER_CREATED, {
      event: EVENTS.ORDER_CREATED,
      orderId: order.id,
      tableId: order.tableId,
      items: order.items,
    });

    res.status(201).json({
      ...order,
      message: "Order created. Table occupation in progress...",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await repo.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await repo.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await repo.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "CONFIRMED") {
      return res.status(400).json({
        error: "Only confirmed orders can be completed",
        currentStatus: order.status,
      });
    }

    const updatedOrder = await repo.updateOrder(id, {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });

    await publishEvent(EVENTS.TABLE_RELEASE_REQUESTED, {
      orderId: id,
      tableId: order.tableId,
      tableName: order.tableName,
    });

    res.json({
      ...order,
      ...updatedOrder,
      message: "Order completed. Table release in progress...",
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ error: "Failed to complete order" });
  }
};
