"use client";

import { db } from "@/firebase/config";
import { IPostState } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { Button } from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, Suspense } from "react";
import styles from "./PostDetail.module.scss";
import { ClipLoader } from "react-spinners";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";
import dynamic from "next/dynamic";
import Loader from "@/components/loader/Loader";

const OwnerActionButtons = dynamic(
  () => import("@/components/ownerActionButtons/OwnerActionButtons"),
  {
    ssr: false,
  }
);

const MarkdownRenderer = dynamic(
  () => import("@/components/markdownRenderer/MarkdownRenderer"),
  {
    loading: () => <Loader />,
    ssr: false, // ✅ 클라이언트 전용 렌더링 (서버에서 제외)
  }
);

const PostDetailClient = () => {
  const [post, setPost] = useState<IPostState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const params = useParams();
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl(); // 현재 블로그 URL
  const { id } = params;
  const [isPublic, setIsPublic] = useState(true);

  const fetchPostDetail = useCallback(async () => {
    try {
      if (!id || typeof id !== "string") return;
      const postRef = doc(db, "posts", id);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        console.log("게시물을 찾을 수 없습니다.");
        router.push("/error"); // 게시물이 없으면 에러 페이지로 리디렉션
        return;
      }

      const postData = postSnap.data();
      const authorUid = postData?.authorUid;

      setIsPublic(postData.isPublic);

      // 작성자 정보 가져오기
      const userCollection = collection(db, "users");
      const authorQuery = query(userCollection, where("uid", "==", authorUid));
      const authorSnapshot = await getDocs(authorQuery);

      const authorData = authorSnapshot.docs[0].data();
      const authorBlogUrl = authorData.blogUrl; // 작성자의 블로그 URL
      // console.log("authorBlogUrl: ", authorBlogUrl);
      // console.log("blogUrl: ", blogUrl);
      // console.log("authorBlogUrl === blogUrl", authorBlogUrl === blogUrl);

      // 블로그 URL 비교
      if (blogUrl && authorBlogUrl !== blogUrl) {
        console.log("이 게시물은 현재 블로그에 속하지 않습니다.");
        router.push("/error"); // 블로그 URL이 다르면 에러 페이지로 리디렉션
        return;
      }

      // 게시물 정보 세팅
      setPost({
        id: postSnap.id,
        title: postData.title || "제목 없음",
        content: postData.content || "내용 없음",
        imageUrl: postData.imageUrl || null,
        isPublic: postData.isPublic || false,
        authorUid: postData.authorUid || "",
        createdAt:
          postData.createdAt instanceof Timestamp
            ? postData.createdAt
            : Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error("게시물 가져오기 오류: ", error);
      router.push("/error"); // 오류 발생 시 에러 페이지로 리디렉션
    } finally {
      setIsLoading(false);
    }
  }, [id, blogUrl, router]);

  useEffect(() => {
    if (!blogUrl) return;
    if (!id || typeof id !== "string") {
      setIsLoading(false);
      return;
    }

    fetchPostDetail();
  }, [id, blogUrl, router]);

  const onDeletePost = async () => {
    if (!id || typeof id !== "string") return;

    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      alert("게시물이 삭제되었습니다.");
      router.push(`/blog/${blogUrl}/post`);
    } catch (error) {
      console.error("게시물 삭제 오류: ", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    }
  };

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null;
  }

  if (isLoading)
    return (
      <ClipLoader
        color="#000000"
        loading={isLoading}
        size={16}
        className={styles.loader}
      />
    );

  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  return (
    <div
      className={`${setThemeClass(
        theme,
        styles.darkPostDetail,
        styles.postDetail
      )} commonWrapper`}
    >
      <div className={styles.postTitle}>
        <h1>
          {isPublic ? (
            post.title
          ) : (
            <>
              {/* <FaLock />  */}
              🔒 {post.title}
            </>
          )}
        </h1>
      </div>
      <Suspense fallback={<div style={{ minHeight: "48px" }} />}>
        <OwnerActionButtons
          actions={[
            {
              label: "수정",
              onClick: () => router.push(`/blog/${blogUrl}/edit/${id}`),
              ariaLabel: "게시물 수정하기 버튼",
            },
            {
              label: "삭제",
              color: "error",
              onClick: onDeletePost,
              ariaLabel: "게시물 삭제하기 버튼",
            },
          ]}
        />
      </Suspense>
      <div className="commonContent">
        {isLoading ? (
          <div className={styles.imageSkeleton} />
        ) : (
          <div style={{ position: "relative", margin: "32px 0 36px" }}>
            {post.imageUrl && (
              <Image
                alt={`${post.title} 이미지`}
                src={post.imageUrl}
                width={600}
                height={400}
                priority
              />
            )}
          </div>
        )}

        <Suspense fallback={<div className={styles.markdownSkeleton} />}>
          <MarkdownRenderer content={post.content} />
        </Suspense>

        <Button
          onClick={() => router.push(`/blog/${blogUrl}/post`)}
          className={styles.commonBtn}
          aria-label="게시물 목록으로 돌아가기 버튼"
        >
          목록으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default PostDetailClient;
