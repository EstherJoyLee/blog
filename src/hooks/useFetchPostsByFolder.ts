import { auth, db } from "@/firebase/config";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const useFetchPostsByFolder = (folderId: string) => {
  const currentUser = auth.currentUser; // 현재 사용자 정보 가져오기 (현재 사용자의 인증 정보 필요)
  interface Post {
    id?: string;
    title?: string;
    content?: string;
    createdAt?: Date;
    isPublic?: boolean;
    authorUid?: string;
    folderId?: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const blogUrl = useGetBlogNameFromUrl();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!folderId) return;

      setIsLoading(true);

      try {
        const userCollection = collection(db, "users");
        const userQuery = query(
          userCollection,
          where("blogUrl", "==", blogUrl)
        );
        const userSnapshot = await getDocs(userQuery);

        const authorUid = userSnapshot.docs[0].id;
        const postsCollection = collection(db, "posts");
        let postsQuery;

        console.log(
          "currentUser?.uid === authorUid: ",
          currentUser?.uid === authorUid
        );

        // 현재 사용자가 존재하는지 확인
        if (currentUser?.uid === authorUid) {
          // 🔹 현재 사용자가 작성자라면 모든 게시물 가져오기 (비공개 포함)
          postsQuery = query(
            postsCollection,
            where("folderId", "==", folderId),
            where("authorUid", "==", currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(10) // 최대 10개만 가져오기 (예시로 한정)
          );
        } else {
          // 🔹 다른 사용자는 공개된 게시물만 가져오기
          postsQuery = query(
            postsCollection,
            where("folderId", "==", folderId),
            where("isPublic", "==", true), // 공개된 게시물만
            orderBy("createdAt", "desc"),
            limit(10)
          );
        }

        const querySnapshot = await getDocs(postsQuery);
        console.log("postsQuery: ", querySnapshot.docs);

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
  }, [folderId, currentUser]); // `currentUser`가 변경될 때마다 다시 실행

  return { posts, isLoading };
};

export default useFetchPostsByFolder;
