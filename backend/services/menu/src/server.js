import app from "./app.js";
import "./listeners/menu.listener.js";

app.listen(process.env.PORT || 8006, () => {
  console.log("Menu Service running on port 8006");
});
