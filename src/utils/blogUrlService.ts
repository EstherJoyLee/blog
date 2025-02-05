import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const generateBlogUrl = (email: string): string => {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

export const getUniqueBlogUrl = async (email: string): Promise<string> => {
  const baseUrl = generateBlogUrl(email);
  let blogUrl = baseUrl;
  let count = 0;

  while (true) {
    const docRef = doc(db, "users", blogUrl);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return blogUrl;
    }

    count++;
    blogUrl = `${baseUrl}${count}`;
  }
};
