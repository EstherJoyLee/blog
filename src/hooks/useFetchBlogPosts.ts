"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { IPostState } from "@/types";
import { onAuthStateChanged } from "firebase/auth"; // ✅ 인증 상태 감지

const useFetchBlogPosts = (blogUrl: string, maxPosts = 10) => {
  const [posts, setPosts] = useState<IPostState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidBlog, setIsValidBlog] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // ✅ 현재 사용자 상태 저장

  useEffect(() => {
    if (blogUrl === "undefined") {
      setIsValidBlog(false);
      return;
    } else {
      setIsValidBlog(true);
    }

    // ✅ 인증 상태 변화 감지 (onAuthStateChanged 사용)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const userCollection = collection(db, "users");
        const userQuery = query(
          userCollection,
          where("blogUrl", "==", blogUrl)
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log("해당 블로그 URL을 가진 사용자가 없습니다.");
          setPosts([]);
          return;
        }

        const authorUid = userSnapshot.docs[0].id;
        const postsCollection = collection(db, "posts");

        let postsQuery;

        if (currentUser && currentUser.uid === authorUid) {
          // 🔹 현재 사용자가 작성자라면 모든 게시물 가져오기 (비공개 포함)
          postsQuery = query(
            postsCollection,
            where("authorUid", "==", authorUid),
            orderBy("createdAt", "desc"),
            limit(maxPosts)
          );
        } else {
          // 🔹 다른 사용자는 공개된 게시물만 가져오기
          postsQuery = query(
            postsCollection,
            where("authorUid", "==", authorUid),
            where("isPublic", "==", true), // ✅ 공개된 게시물만 가져오기
            orderBy("createdAt", "desc"),
            limit(maxPosts)
          );
        }

        const postSnapshot = await getDocs(postsQuery);
        const postList: IPostState[] = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          imageUrl: doc.data().imageUrl,
          isPublic: doc.data().isPublic,
          authorUid: doc.data().authorUid,
          createdAt: doc.data().createdAt || new Date(),
        }));

        setPosts(postList);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching posts:", error.message);
        }
        setIsLoading(false);
      }
    };

    fetchPosts();

    return () => unsubscribe(); // ✅ 컴포넌트 언마운트 시 리스너 정리
  }, [blogUrl, currentUser]);

  return { posts, isLoading, isValidBlog };
};

export default useFetchBlogPosts;
