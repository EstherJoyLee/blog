"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IPostState } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";

const HomeClient = () => {
  const [posts, setPosts] = useState<IPostState[]>([]); // 최신 게시물 목록
  const [isBlogName, setIsBlogName] = useState(true);
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();

  useEffect(() => {
    if (blogUrl === "undefined") {
      setIsBlogName(false);
    } else {
      setIsBlogName(true);
    }

    const fetchPosts = async () => {
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

        // 최신순으로 최대 10개 게시물 가져오기
        const postsQuery = query(
          postsCollection,
          where("authorUid", "==", authorUid),
          orderBy("createdAt", "desc"),
          limit(10)
        );

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
      } catch (error) {
        console.error("게시물 가져오기 오류:", error);
      }
    };

    fetchPosts();
  }, [blogUrl]);

  const handleView = (postId: string) => {
    router.push(`/blog/${blogUrl}/post/${postId}`);
  };

  return (
    <>
      {isBlogName ? (
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
                        src={post.imageUrl}
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
        </div>
      ) : (
        <h1>잘못된 접근입니다.</h1>
      )}
    </>
  );
};

export default HomeClient;
