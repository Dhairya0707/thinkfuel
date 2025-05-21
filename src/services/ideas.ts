import { db } from "../../service/firebase.config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Idea } from "../types";
import { toast } from "sonner";

export const ideasService = {
  async getIdeaById(id: string): Promise<Idea | null> {
    try {
      const ideaRef = doc(db, "ideas", id);
      const ideaSnap = await getDoc(ideaRef);

      if (ideaSnap.exists()) {
        return {
          id: ideaSnap.id,
          ...ideaSnap.data(),
        } as Idea;
      }
      return null;
    } catch (error) {
      console.error("Error fetching idea:", error);
      toast.error("Failed to fetch idea");
      return null;
    }
  },

  async getUserIdeas(userId: string): Promise<Idea[]> {
    try {
      const ideasQuery = query(
        collection(db, "ideas"),
        where("ownerId", "==", userId)
      );
      const ideasSnapshot = await getDocs(ideasQuery);
      return ideasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Idea[];
    } catch (error) {
      console.error("Error fetching user ideas:", error);
      toast.error("Failed to fetch ideas");
      return [];
    }
  },

  async updateIdea(id: string, data: Partial<Idea>): Promise<boolean> {
    try {
      const docRef = doc(db, "ideas", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Failed to update idea:", error);
      toast.error("Failed to update idea");
      return false;
    }
  },
};
