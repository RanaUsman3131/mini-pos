import { publishToQueue } from "../config/rabbitmq.js";

export const publishEvent = async (type, payload) => {
  try {
    await publishToQueue(type, payload);
    return true;
  } catch (error) {
    console.error(`[EVENT] Failed to publish ${type}:`, error);
    throw error;
  }
};
