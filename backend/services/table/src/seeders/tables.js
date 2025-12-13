import { db } from "../firebase/firebase.js";

const tables = [
  { name: "Table 1 (R0)", seats: 4, status: "available" },
  { name: "Table 2 (R1)", seats: 2, status: "available" },
  { name: "Table 3 (R2)", seats: 6, status: "occupied" },
];

async function run() {
  for (const t of tables) {
    await db.collection("tables").add({ ...t, createdAt: new Date() });
  }
  console.log("Tables seed completed");
}

run().catch((err) => {
  console.error("Tables seed failed:", err);
  process.exit(1);
});
