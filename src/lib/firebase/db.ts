import { auth, db } from "../firebase";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * createSession(sessionId)
 * - requires auth.currentUser to exist (anonymous uid)
 * - writes owner = uid so rules can enforce writes
 */
export async function createSession(sessionId: string) {
  const uid = auth.currentUser?.uid ?? null;
  if (!uid) {
    // safety: ensure auth ready before creating sessions (caller should await auth)
    throw new Error("Auth not ready - cannot create session");
  }

  const ref = doc(db, "sessions", sessionId);
  await setDoc(ref, {
    sessionId,
    owner: uid,
    isActive: true,
    createdAt: serverTimestamp(),
    lastLocation: null,
    updatedAt: null,
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
