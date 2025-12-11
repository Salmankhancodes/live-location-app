import { db } from "../firebase";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function createSession(sessionId: string) {
  const ref = doc(db, "sessions", sessionId);

  await setDoc(ref, {
    sessionId,
    isActive: true,
    createdAt: serverTimestamp(),
    ownerLocation: {
      lat: null,
      lng: null,
      updatedAt: serverTimestamp()
    }
  });

  return sessionId;
}

export async function updateOwnerLocation(sessionId: string, lat: number, lng: number) {
  const ref = doc(db, "sessions", sessionId);
  await updateDoc(ref, {
    ownerLocation: {
      lat,
      lng,
      updatedAt: serverTimestamp()
    }
  });
}

export async function getSession(sessionId: string) {
  const ref = doc(db, "sessions", sessionId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
