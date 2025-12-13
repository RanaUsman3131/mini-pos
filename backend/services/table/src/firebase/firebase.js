import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(
      fs.readFileSync(
        "/home/usmankhan/Dev/mini-pos/backend/shared/firebase/firebase-key.json",
        "utf8"
      )
    )
  ),
});

export const db = admin.firestore();
