"use client";

import { useIsOwner } from "@/components/checkIsOwner/CheckIsOwner";
import { db } from "@/firebase/config";
import { IPostState } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { Button } from "@mui/material";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./PostDetail.module.scss";

const PostDetailClient = () => {
  const [post, setPost] = useState<IPostState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const params = useParams();
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();
  const { id } = params;
  const { isOwner } = useIsOwner();

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setIsLoading(false);
      return;
    }

    const fetchPostDetail = async () => {
      try {
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost({
            id: postSnap.id,
            title: postSnap.data().title || "제목 없음",
            content: postSnap.data().content || "내용 없음",
            imageUrl: postSnap.data().imageUrl || null,
            isPublic: postSnap.data().isPublic || false,
            authorUid: postSnap.data().authorUid || "",
            createdAt:
              postSnap.data().createdAt instanceof Timestamp
                ? postSnap.data().createdAt
                : Timestamp.fromDate(new Date()),
          });
        } else {
          console.log("게시물을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("게시물 가져오기 오류: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetail();
  }, [id]);

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
  console.log("Checking IsOnwerContext: ", isOwner);
  if (isLoading) return <div>로딩 중...</div>;

  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  return (
    <>
      <div>
        <div className={styles.postTitle}>
          <h1>{post.title}</h1>
          {isOwner && (
            <div className={styles.btnGroup}>
              <Button
                onClick={() => router.push(`/blog/${blogUrl}/edit/${id}`)}
              ></Button>
              <Button
                variant="contained"
                color="error"
                onClick={onDeletePost}
              ></Button>
            </div>
          )}
        </div>
        <p>{post.content}</p>
        {post.imageUrl && (
          <Image
            alt={`${post.title} 이미지`}
            src={post.imageUrl}
            width={600}
            height={400}
          />
        )}
        <p>{post.isPublic ? "공개" : "비공개"}</p>
        <Button onClick={() => router.push(`/blog/${blogUrl}/post`)}>
          목록으로 돌아가기
        </Button>
      </div>
    </>
  );
};

export default PostDetailClient;
