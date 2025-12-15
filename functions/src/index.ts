import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const EXPIRY_MINUTES = 10;

export const expireInactiveSessions = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    const now = Date.now();
    const expiryTime = now - EXPIRY_MINUTES * 60 * 1000;

    const snapshot = await db
      .collection("sessions")
      .where("isActive", "==", true)
      .get();

    const batch = db.batch();
    let expiredCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const updatedAt = data.updatedAt?.toMillis?.();

      if (!updatedAt) return;

      if (updatedAt < expiryTime) {
        batch.update(doc.ref, {
          isActive: false,
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          expireReason: "INACTIVITY",
        });
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      await batch.commit();
    }

    console.log(`Expired ${expiredCount} sessions`);
    return null;
  });
