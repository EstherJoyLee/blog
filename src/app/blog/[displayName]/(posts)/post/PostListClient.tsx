"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  QueryDocumentSnapshot,
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
  const [posts, setPosts] = useState<IPostState[]>([]);
  const [lastVisibleDoc, setLastVisibleDoc] =
    useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();
  const currentUser = auth.currentUser;
  const maxPosts = 5; // 한 번에 가져올 게시물 개수

  // ✅ Firestore에서 게시물 가져오기
  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    console.log("🚀 fetchPosts 실행됨");
    console.log("🚀 hasMore: ", hasMore);

    try {
      const userCollection = collection(db, "users");
      const userQuery = query(userCollection, where("blogUrl", "==", blogUrl));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log("❌ 해당 블로그의 사용자를 찾을 수 없음");
        setLoading(false);
        return;
      }

      const authorUid = userSnapshot.docs[0].id;
      const postsCollection = collection(db, "posts");

      let postsQuery = query(
        postsCollection,
        where("authorUid", "==", authorUid),
        orderBy("createdAt", "desc"),
        limit(maxPosts)
      );

      if (currentUser?.uid !== authorUid) {
        // 현재 사용자가 작성자가 아니면 공개된 게시물만 가져오기
        postsQuery = query(postsQuery, where("isPublic", "==", true));
      }

      if (lastVisibleDoc) {
        console.log("📌 기존 마지막 문서:", lastVisibleDoc.id);
        postsQuery = query(postsQuery, startAfter(lastVisibleDoc));
      }

      const postSnapshot = await getDocs(postsQuery);
      const newPosts = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IPostState[];

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);

      // 🔥 가져온 게시물 개수가 maxPosts보다 적다면 더 이상 불러올 데이터가 없음!
      if (newPosts.length < maxPosts) {
        console.log(
          "⚠️ 가져온 게시물이 maxPosts보다 적음 → hasMore = false 설정"
        );
        setHasMore(false);
      }

      // ✅ 마지막 문서 업데이트
      const lastDoc =
        postSnapshot.docs.length > 0
          ? postSnapshot.docs[postSnapshot.docs.length - 1]
          : null;
      setLastVisibleDoc(lastDoc);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }

    setLoading(false);
  };

  // ✅ 블로그 URL 변경 시 초기 게시물 불러오기
  useEffect(() => {
    if (blogUrl) {
      setPosts([]); // 초기화
      setLastVisibleDoc(null);
      setHasMore(true);
      fetchPosts();
    }
  }, [blogUrl]);

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
        {posts.length > 0 ? (
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
        {/* ✅ 더보기 버튼 (더 이상 불러올 게시물이 없으면 숨김) */}
        {hasMore && (
          <div className={styles.seeMoreBtn}>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className={styles.loadMoreBtn}
            >
              {loading ? "로딩 중..." : "더보기"}
            </button>
          </div>
        )}
      </div>

      {/* ✅ 로딩 상태 표시 */}
      {loading && <Loader />}
    </div>
  );
};

export default PageListClient;
