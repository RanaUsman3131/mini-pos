import app from "./app.js";
import "./listeners/menu.listener.js";

app.listen(8002, () => {
  console.log("Menu Service running on port 8002");
});
