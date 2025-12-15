import { PubSub } from "@google-cloud/pubsub";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pubSubClient = null;

const PROJECT_ID = "mini-pos-fc760" || process.env.PROJECT_ID;

export const connectPubSub = async () => {
  try {
    if (pubSubClient) {
      return pubSubClient;
    }

    pubSubClient = new PubSub({
      projectId: PROJECT_ID,
      keyFilename: path.join(
        __dirname,
        "../../../../shared/firebase/firebase-key.json"
      ),
    });

    console.log("[PubSub] Connected successfully");
    return pubSubClient;
  } catch (error) {
    console.error("[PubSub] Failed to connect:", error.message);
    throw error;
  }
};

export const getPubSubClient = async () => {
  if (!pubSubClient) {
    await connectPubSub();
  }
  return pubSubClient;
};

export const publishToTopic = async (topicName, message) => {
  try {
    const client = await getPubSubClient();
    const topic = client.topic(topicName);

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const messageId = await topic.publishMessage({ data: messageBuffer });

    console.log(`[PubSub] Message ${messageId} published to ${topicName}`);
    return messageId;
  } catch (error) {
    console.error("[PubSub] Failed to publish message:", error);
    throw error;
  }
};

export const subscribeToTopic = async (subscriptionName, callback) => {
  try {
    const client = await getPubSubClient();
    const subscription = client.subscription(subscriptionName);

    const messageHandler = async (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        const eventType = message.attributes?.eventType || data.event;

        await callback(data, eventType);
        message.ack();
      } catch (error) {
        console.error("[PubSub] Error processing message:", error);
        message.nack();
      }
    };

    subscription.on("message", messageHandler);
    subscription.on("error", (error) => {
      console.error("[PubSub] Subscription error:", error);
    });

    console.log(`[PubSub] Listening to subscription: ${subscriptionName}`);
    return subscription;
  } catch (error) {
    console.error("[PubSub] Failed to subscribe:", error);
    throw error;
  }
};

export const createTopicIfNotExists = async (topicName) => {
  try {
    const client = await getPubSubClient();
    const topic = client.topic(topicName);
    const [exists] = await topic.exists();

    if (!exists) {
      await client.createTopic(topicName);
      console.log(`[PubSub] Topic ${topicName} created`);
    }

    return topic;
  } catch (error) {
    console.error(`[PubSub] Error creating topic ${topicName}:`, error);
    throw error;
  }
};

export const createSubscriptionIfNotExists = async (
  topicName,
  subscriptionName
) => {
  try {
    const client = await getPubSubClient();
    const topic = client.topic(topicName);
    const subscription = topic.subscription(subscriptionName);
    const [exists] = await subscription.exists();

    if (!exists) {
      await topic.createSubscription(subscriptionName);
      console.log(
        `[PubSub] Subscription ${subscriptionName} created for topic ${topicName}`
      );
    } else {
      console.log(`[PubSub] Subscription ${subscriptionName} already exists`);
    }

    return subscription;
  } catch (error) {
    if (error.code === 6) {
      console.log(`[PubSub] Subscription ${subscriptionName} already exists`);
      const client = await getPubSubClient();
      const topic = client.topic(topicName);
      return topic.subscription(subscriptionName);
    }
    console.error(
      `[PubSub] Error creating subscription ${subscriptionName}:`,
      error
    );
    throw error;
  }
};
