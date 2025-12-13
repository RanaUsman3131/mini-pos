import amqp from "amqplib";

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE_NAME = "mini_pos_events";
const EXCHANGE_TYPE = "topic";

export const connectRabbitMQ = async () => {
  try {
    if (connection && channel) {
      return { connection, channel };
    }

    console.log("[RabbitMQ] Connecting to RabbitMQ...");
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Create exchange for publishing events
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    console.log("[RabbitMQ] Connected successfully");

    // Handle connection errors
    connection.on("error", (err) => {
      console.error("[RabbitMQ] Connection error:", err);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      console.log("[RabbitMQ] Connection closed");
      connection = null;
      channel = null;
    });

    return { connection, channel };
  } catch (error) {
    console.error("[RabbitMQ] Failed to connect:", error.message);
    throw error;
  }
};

export const getChannel = async () => {
  if (!channel) {
    await connectRabbitMQ();
  }
  return channel;
};

export const publishToQueue = async (routingKey, message) => {
  try {
    const ch = await getChannel();
    const messageBuffer = Buffer.from(JSON.stringify(message));

    ch.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
      contentType: "application/json",
    });

    console.log(`[RabbitMQ] Published event: ${routingKey}`);
    return true;
  } catch (error) {
    console.error("[RabbitMQ] Failed to publish message:", error);
    throw error;
  }
};

export const consumeQueue = async (queueName, routingKeys, callback) => {
  try {
    const ch = await getChannel();

    // Assert queue
    await ch.assertQueue(queueName, { durable: true });

    // Bind queue to exchange with routing keys
    for (const key of routingKeys) {
      await ch.bindQueue(queueName, EXCHANGE_NAME, key);
      console.log(`[RabbitMQ] Bound queue ${queueName} to routing key: ${key}`);
    }

    // Set prefetch to 1 for fair dispatch
    await ch.prefetch(1);

    // Consume messages
    await ch.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[RabbitMQ] Received event: ${msg.fields.routingKey}`);

            await callback(content, msg.fields.routingKey);

            // Acknowledge the message
            ch.ack(msg);
          } catch (error) {
            console.error("[RabbitMQ] Error processing message:", error);
            // Reject and requeue the message
            ch.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );

    console.log(`[RabbitMQ] Listening on queue: ${queueName}`);
  } catch (error) {
    console.error("[RabbitMQ] Failed to consume queue:", error);
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log("[RabbitMQ] Connection closed gracefully");
  } catch (error) {
    console.error("[RabbitMQ] Error closing connection:", error);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeConnection();
  process.exit(0);
});
