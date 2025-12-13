import { publishToQueue } from "../config/rabbitmq.js";

export const publishEvent = async (type, payload) => {
  try {
    console.log(`[EVENT] Publishing ${type}`, payload);

    // Publish to RabbitMQ with routing key
    await publishToQueue(type, payload);

    return true;
  } catch (error) {
    console.error(`[EVENT] Failed to publish ${type}:`, error);
    throw error;
  }
};
