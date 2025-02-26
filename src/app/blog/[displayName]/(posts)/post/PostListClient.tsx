"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IPostState } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import Loader from "@/components/loader/Loader";
import MarkdownRenderer from "@/components/markdownRenderer/MarkdownRenderer";
import styles from "./PostListClient.module.scss";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";

const PageListClient = () => {
  const postsRef = useRef<IPostState[]>([]);
  const [posts, setPosts] = useState<IPostState[]>([]);
  const [maxPosts] = useState<number>(5);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const blogUrl = useGetBlogNameFromUrl();
  const currentUser = auth.currentUser;

  // ✅ Firestore에서 게시물 가져오기
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    let postSnapshot;
    let postsQuery;
    try {
      const userCollection = collection(db, "users");

      const userQuery = query(userCollection, where("blogUrl", "==", blogUrl));

      const userSnapshot = await getDocs(userQuery);
      const authorUid = userSnapshot.docs[0].id;
      const postsCollection = collection(db, "posts");

      if (currentUser?.uid === authorUid) {
        // 🔹 현재 사용자가 작성자라면 모든 게시물 가져오기 (비공개 포함)
        postsQuery = query(
          postsCollection,
          where("authorUid", "==", authorUid),
          orderBy("createdAt", "desc"),
          limit(maxPosts) // 최대 maxPosts개만 가져오기 (예시로 한정)
        );
      } else {
        // 🔹 다른 사용자는 공개된 게시물만 가져오기
        postsQuery = query(
          postsCollection,
          where("authorUid", "==", authorUid),
          where("isPublic", "==", true), // 공개된 게시물만
          orderBy("createdAt", "desc"),
          limit(maxPosts)
        );
      }

      if (lastVisibleDoc) {
        postsQuery = query(postsQuery, startAfter(lastVisibleDoc));
      }

      if (!postsQuery) {
        console.error("❌ postsQuery가 유효하지 않습니다.");
        setLoading(false);
        return;
      }

      postSnapshot = await getDocs(postsQuery);
      if (!postSnapshot || postSnapshot.empty) {
        // console.log("❌ 가져올 게시물이 없습니다.");
        setHasMore(false);
        setLoading(false);
        return;
      }

      const newPosts = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // console.log("✅ 가져온 게시물 리스트:", newPosts);

      // ✅ 중복 추가 방지 (기존 postsRef에 있는 데이터와 비교)
      const uniqueNewPosts = newPosts.filter(
        (newPost) =>
          !postsRef.current.some(
            (existingPost) => existingPost.id === newPost.id
          )
      );

      postsRef.current = [...postsRef.current, ...uniqueNewPosts]; // ✅ 기존 데이터를 유지한 채 업데이트
      setPosts([...postsRef.current]); // ✅ 상태 업데이트

      // ✅ 마지막 문서 업데이트 (페이지네이션 유지)
      const lastDoc = postSnapshot.docs[postSnapshot.docs.length - 1];
      setLastVisibleDoc(lastDoc || null);

      setLoading(false);
    } catch (error) {
      // console.error("❌ Error fetching posts:", error);
      setLoading(false);
    }
  }, [hasMore, lastVisibleDoc, maxPosts, loading, blogUrl]);

  // ✅ 불필요한 `setPosts([])` 제거하여 기존 데이터 유지
  useEffect(() => {
    if (blogUrl) {
      fetchPosts();
    }
  }, [blogUrl]); // ✅ pathname(blogUrl) 변경 시에만 실행

  // ✅ 무한 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading]);

  const handleView = (postId: string) => {
    router.push(`/blog/${blogUrl}/post/${postId}`);
  };

  const { theme, mounted } = useMountedTheme();
  if (!mounted) {
    return;
  }

  return (
    <div
      className={`${setThemeClass(
        theme,
        styles.darkPostListWrapper,
        styles.postListWrapper
      )} commonWrapper`}
    >
      <h1 className="commonTitle">전체 게시물</h1>

      <div className="commonContent">
        {posts.length > 0 || postsRef.current.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className={styles.postListItem}
              style={{ marginBottom: "20px" }}
            >
              <h2
                onClick={() => handleView(post.id)}
                style={{ cursor: "pointer" }}
              >
                {post.title}
              </h2>
              <div>
                {post.imageUrl && (
                  <div style={{ position: "relative", margin: "32px 0 36px" }}>
                    <Image
                      alt={`${post.title} 이미지`}
                      src={post.imageUrl || ""}
                      width={200}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <MarkdownRenderer content={post.content} />
              </div>
            </div>
          ))
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </div>

      <div ref={loaderRef} style={{ height: "50px", margin: "20px 0" }}>
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default PageListClient;
