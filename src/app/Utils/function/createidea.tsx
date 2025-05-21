import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../../service/firebase.config";
import { toast } from "sonner";

export async function createIdea(
  ideaData: {
    title: string;
    body: string;
    tags?: string[];
    visibility: "public" | "private";
  },
  userId?: string
) {
  try {
    const ideaDocRef = doc(collection(db, "ideas"));

    const data = {
      id: ideaDocRef.id,
      title: ideaData.title,
      body: ideaData.body,
      tags: ideaData.tags || [],
      visibility: ideaData.visibility,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: userId,
    };

    await setDoc(ideaDocRef, data);
    toast.success("Idea Created success !");
    toast.success(`Idea id : ${ideaDocRef.id} `);
    return ideaDocRef.id;
  } catch (error) {
    toast.error(`Something went wrong, Try again : ${error} `);
  }
}
