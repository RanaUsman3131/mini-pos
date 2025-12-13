export const publishEvent = async (type, payload) => {
  console.log(`[TABLE EVENT] ${type}`, payload);
  // Integrate with message broker here if needed (NATS/RabbitMQ/etc.)
};
