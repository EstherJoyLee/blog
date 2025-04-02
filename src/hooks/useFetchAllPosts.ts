import { useEffect, useState } from "react";
import { collection, query, orderBy, where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { IPostState } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import getAuthorUidByBlogUrl from "@/utils/getAuthorUidByBlogUrl";

const useFetchAllPosts = () => {
  const [allPosts, setAllPosts] = useState<IPostState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const blogUrl = useGetBlogNameFromUrl();

  useEffect(() => {
    // Firebase Auth의 상태 변화 감지
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!blogUrl) return;
    const fetchPosts = async () => {
      let postsQuery;
      setIsLoading(true);
      try {
        const authorUid = await getAuthorUidByBlogUrl(blogUrl);
        // console.log("😭authorUid:", authorUid);
        // console.log("😭currentUser:", currentUser);
        const postsCollection = collection(db, "posts");
        // const q = query(
        //   postsCollection,
        //   where("authorUid", "==", authorUid),
        //   orderBy("createdAt", "desc")
        // );
        if (currentUser?.uid === authorUid) {
          // 🔹 현재 사용자가 작성자라면 모든 게시물 가져오기 (비공개 포함)
          postsQuery = query(
            postsCollection,
            where("authorUid", "==", authorUid),
            orderBy("createdAt", "desc")
          );
        } else {
          // 🔹 다른 사용자는 공개된 게시물만 가져오기
          postsQuery = query(
            postsCollection,
            where("authorUid", "==", authorUid),
            where("isPublic", "==", true), // 공개된 게시물만
            orderBy("createdAt", "desc")
          );
        }

        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
          const postList: IPostState[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as IPostState[];

          setAllPosts(postList);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("❌ 게시물 가져오기 오류:", error);
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [blogUrl, currentUser]); // ✅ currentUser가 변경될 때도 실행

  return { allPosts, isLoading };
};

export default useFetchAllPosts;
