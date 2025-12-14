import amqp from "amqplib";

let channel = null;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const EXCHANGE_NAME = "mini_pos_events";

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    return channel;
  } catch (error) {
    throw error;
  }
};

export const subscribeToEvent = async (eventType, handler) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  const queue = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue.queue, EXCHANGE_NAME, eventType);

  channel.consume(
    queue.queue,
    async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          await handler(payload);
          channel.ack(msg);
        } catch (error) {
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false }
  );
};

export const publishToQueue = async (eventType, payload) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  channel.publish(
    EXCHANGE_NAME,
    eventType,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
};

export const getChannel = () => channel;
