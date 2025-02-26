import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";

const getAuthorUidByBlogUrl = async (blogUrl: string) => {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("blogUrl", "==", blogUrl));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data().uid;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ 블로그 주인의 UID 가져오기 오류:", error);
    }
  }
  return null;
};

export default getAuthorUidByBlogUrl;
