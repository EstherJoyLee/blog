"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import useFetchBlogPosts from "@/hooks/useFetchBlogPosts";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import styles from "./HomeClient.module.scss";
import Loader from "@/components/loader/Loader";

const HomeClient = () => {
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();
  const { posts, isLoading, isValidBlog } = useFetchBlogPosts(blogUrl, 10);

  // console.log("😡😡isValidBlog: ", isValidBlog);

  const handleView = (postId: string) => {
    router.push(`/blog/${blogUrl}/post/${postId}`);
  };

  const { theme, mounted } = useMountedTheme();

  useEffect(() => {
    if (!mounted) return;
  }, [mounted]);

  return (
    <>
      {isValidBlog ? (
        <div
          className={`commonWrapper ${setThemeClass(
            theme,
            styles.darkPostWrapper,
            styles.postWrapper
          )}`}
        >
          <h1 className="commonTitle">최신 게시물</h1>
          <div className={`commonContent ${styles.postContent}`}>
            {isLoading ? (
              <Loader />
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <div className={styles.postImage}>
                    <Image
                      alt={`${post.title} 이미지`}
                      src={
                        post.imageUrl && post.imageUrl.trim() !== ""
                          ? post.imageUrl
                          : "/images/default.jpeg"
                      }
                      width={200}
                      height={200}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <h2
                    onClick={() => handleView(post.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {post.title}
                  </h2>
                  {/* <p>{post.content}</p> */}
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
