import app from "./app.js";
import "./listeners/order.listener.js";

const PORT = process.env.PORT || 8005;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
