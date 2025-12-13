import { db } from "../firebase/firebase.js";

const items = [
  {
    name: "Pizza",
    price: 10,
    category: "Food",
    total_stock: 100,
    remaining_stock: 100,
  },
  {
    name: "Burger",
    price: 7,
    category: "Food",
    total_stock: 100,
    remaining_stock: 100,
  },
  {
    name: "Sandwich",
    price: 5,
    category: "Food",
    total_stock: 100,
    remaining_stock: 100,
  },
  {
    name: "Icecream",
    price: 4,
    category: "Food",
    total_stock: 100,
    remaining_stock: 100,
  },
  {
    name: "Cold drink",
    price: 3,
    category: "Drink",
    total_stock: 100,
    remaining_stock: 100,
  },
  {
    name: "Pasta",
    price: 8,
    category: "Food",
    total_stock: 100,
    remaining_stock: 0,
  },
];

for (const item of items) {
  await db.collection("menu_items").add(item);
}

console.log("Menu seed completed");
