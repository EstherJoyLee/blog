import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export const checkBlogNameMatch = async (
  blogName: string
): Promise<boolean> => {
  const userRef = collection(db, "users");
  const querySnapshot = await getDocs(userRef);

  for (const doc of querySnapshot.docs) {
    const userData = doc.data();
    if (userData.blogUrl === blogName) {
      return true;
    }
  }

  return false;
};
