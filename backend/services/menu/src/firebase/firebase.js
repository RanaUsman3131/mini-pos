import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";
const keyPath = isProduction
  ? "/etc/secrets/firebase-key.json"
  : path.join(__dirname, "../../../../shared/firebase/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(keyPath, "utf8"))
  ),
});

export const db = admin.firestore();
