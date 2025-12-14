import app from "./app.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { registerTableListeners } from "./listeners/table.listener.js";

const startServer = async () => {
  try {
    await connectRabbitMQ();
    await registerTableListeners();
    app.listen(process.env.PORT || 8007, () => {
      console.log(`Table Service running on port ${process.env.PORT || 8007}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
