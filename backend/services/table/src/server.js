import app from "./app.js";
import { connectPubSub, createTopicIfNotExists } from "./config/pubsub.js";
import { registerTableListeners } from "./listeners/table.listener.js";

const startServer = async () => {
  try {
    await connectPubSub();
    await createTopicIfNotExists("mini-pos-events");
    await registerTableListeners();
    app.listen(process.env.PORT || 8007, () => {
      console.log(`Table Service running on port ${process.env.PORT || 8007}`);
    });
  } catch (error) {
    console.error("Failed to start Table Service:", error);
    process.exit(1);
  }
};

startServer();
