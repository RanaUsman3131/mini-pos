import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../../../shared/firebase/firebase-key.json"),
        "utf8"
      )
    )
  ),
});

export const db = admin.firestore();
