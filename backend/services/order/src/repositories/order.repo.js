import { db } from "../firebase/firebase.js";

const collection = db.collection("orders");

export const createOrder = async (data) => {
  const orderData = {
    ...data,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  const doc = await collection.add(orderData);

  return { id: doc.id, ...orderData };
};

export const getAllOrders = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getOrderById = async (id) => {
  const doc = await collection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateOrder = async (id, data) => {
  await collection.doc(id).update(data);
  return { id, ...data };
};

export const deleteOrder = async (id) => {
  await collection.doc(id).delete();
};
