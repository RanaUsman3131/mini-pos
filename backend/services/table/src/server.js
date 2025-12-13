import app from "./app.js";

app.listen(process.env.PORT || 8004, () => {
  console.log(`Table Service running on port ${process.env.PORT || 8004}`);
});
