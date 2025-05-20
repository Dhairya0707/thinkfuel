import { useEffect, useState } from "react";
import { auth } from "../../../../service/firebase.config";

// export const useruid = async () => {
//   return auth.currentUser?.uid;
// };
export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
        });

        const result = await res.json();
        setUserData(result.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  //   setLoading(false);

  return { userData, loading };
}
