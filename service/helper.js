import { db } from "./firebase.config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const createUserDocument = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Anonymous",
      email: user.email,
      plan: "free",
      tokens: 20,
      createdAt: serverTimestamp(),
    });
  }
};
