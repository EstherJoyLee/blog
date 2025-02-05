import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { IPostState } from "@/types";

const useFetchAllPosts = () => {
  const [allPosts, setAllPosts] = useState<IPostState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        console.log("🔄 전체 게시물 가져오는 중...");
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const postList: IPostState[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IPostState[];

        console.log("✅ 모든 게시물 불러옴:", postList);
        setAllPosts(postList);
      } catch (error) {
        console.error("❌ 게시물 가져오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { allPosts, isLoading };
};

export default useFetchAllPosts;
