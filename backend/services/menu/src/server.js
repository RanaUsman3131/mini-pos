import app from "./app.js";
import "./listeners/menu.listener.js";

app.listen(process.env.PORT || 8001, () => {
  console.log(`Menu Service running on port ${process.env.PORT || 8001}`);
});
