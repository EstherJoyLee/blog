import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const useFetchPostsByFolder = (folderId: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!folderId) return;

      setIsLoading(true);

      try {
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, where("folderId", "==", folderId));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts by folder: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [folderId]);

  return { posts, isLoading };
};

export default useFetchPostsByFolder;
