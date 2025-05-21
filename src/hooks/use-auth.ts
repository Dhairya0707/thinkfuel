import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../service/firebase.config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              auth: {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              },
              firestore: userData as User["firestore"],
            });
          } else {
            setUser({
              auth: {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              },
              firestore: null,
            });
          }
        } catch (error) {
          console.error("Error fetching Firestore user data:", error);
          toast.error("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, loading };
}
