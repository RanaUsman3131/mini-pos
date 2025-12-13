import { db } from "../firebase/firebase.js";

const collection = db.collection("tables");

export const createTable = async (data) => {
  const doc = await collection.add(data);
  return { id: doc.id, ...data };
};

export const getAllTables = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getTableById = async (id) => {
  const doc = await collection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateTable = async (id, data) => {
  await collection.doc(id).update(data);
};

export const deleteTable = async (id) => {
  await collection.doc(id).delete();
};
