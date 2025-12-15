import { publishToTopic } from "../config/pubsub.js";

const TOPIC_NAME = "mini-pos-events";

export const publishEvent = async (type, payload) => {
  try {
    await publishToTopic(TOPIC_NAME, { ...payload, event: type });
    console.log(`[EVENT] Published event ${type}`);
    return true;
  } catch (error) {
    console.error(`[EVENT] Failed to publish ${type}:`, error);
    throw error;
  }
};
