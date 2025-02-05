"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { useRouter } from "next/navigation"; // 페이지 라우팅
import Image from "next/image";
import { IPostState } from "@/types";
import { ClipLoader } from "react-spinners"; // 로딩 스피너
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";

const PageListClient = () => {
  const [posts, setPosts] = useState<IPostState[]>([]); // 게시물 상태
  const [maxPosts] = useState<number>(5); // 한 번에 가져올 게시물 수
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null); // 마지막 문서
  const [hasMore, setHasMore] = useState<boolean>(true); // 더 가져올 게시물이 있는지 여부
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null); // 무한 스크롤 감지용
  const blogUrl = useGetBlogNameFromUrl();

  // 게시물 데이터 가져오기
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return; // 로딩 중이거나 더 가져올 게시물이 없으면 종료
    setLoading(true); // 로딩 시작

    try {
      const postsCollection = collection(db, "posts");
      let postsQuery = query(
        postsCollection,
        orderBy("createdAt", "desc"),
        limit(maxPosts)
      );

      if (lastVisibleDoc) {
        postsQuery = query(
          postsCollection,
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDoc),
          limit(maxPosts)
        );
      }

      const postSnapshot = await getDocs(postsQuery);
      const postList = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("postList: ", postList);
      setPosts((prevPosts) => {
        const newPosts = postList.filter(
          (post) => !prevPosts.some((p) => p.id === post.id)
        );
        return [...prevPosts, ...newPosts];
      });

      // 마지막 문서 저장
      const lastDoc = postSnapshot.docs[postSnapshot.docs.length - 1];
      setLastVisibleDoc(lastDoc || null);

      // 더 가져올 게시물이 없으면 hasMore를 false로 설정
      if (postList.length < maxPosts) {
        setHasMore(false);
      }

      setLoading(false); // 로딩 종료
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false); // 에러 발생 시 로딩 종료
    }
  }, [hasMore, lastVisibleDoc, maxPosts, loading]);

  // 무한 스크롤 감지
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
  }, [fetchPosts, hasMore, lastVisibleDoc, maxPosts, loading]);

  const handleView = (postId: string) => {
    router.push(`/blog/${blogUrl}/post/${postId}`); // 상세 페이지로 이동
  };

  return (
    <div>
      <h1>최신 게시물</h1>

      <div>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} style={{ marginBottom: "20px" }}>
              <h2
                onClick={() => handleView(post.id)}
                style={{ cursor: "pointer" }}
              >
                {post.title}
              </h2>
              <p>{post.content}</p>
              {post.imageUrl && (
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <Image
                    alt={`${post.title} 이미지`}
                    src={post.imageUrl || ""}
                    width={200}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </div>

      <div ref={loaderRef} style={{ height: "50px", margin: "20px 0" }}>
        {loading ? (
          <ClipLoader color="#000000" loading={loading} size={50} />
        ) : hasMore ? (
          <p>로딩 중...</p>
        ) : (
          <p>더 이상 게시물이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default PageListClient;
