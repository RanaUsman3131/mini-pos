import { db } from "../firebase/firebase.js";

const collection = db.collection("menu_items");

export const createMenuItem = async (data) => {
  const doc = await collection.add(data);
  return { id: doc.id, ...data };
};

export const getAllMenuItems = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getMenuItemById = async (id) => {
  const doc = await collection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateMenuItem = async (id, data) => {
  await collection.doc(id).update(data);
};

export const deleteMenuItem = async (id) => {
  await collection.doc(id).delete();
};
