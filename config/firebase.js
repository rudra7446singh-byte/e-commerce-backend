import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendPushNotification = async (tokens, notification, data = {}) => {
  if (!tokens) return;

  if (Array.isArray(tokens) && tokens.length > 0) {
    return admin.messaging().sendEachForMulticast({
      tokens,
      notification,
      data,
    });
  }

  if (typeof tokens === "string" && tokens.trim()) {
    return admin.messaging().send({
      token: tokens,
      notification,
      data,
    });
  }
};

export default admin;
