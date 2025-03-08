"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import styles from "./HomeClient.module.scss";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string | null;
}

interface HomeClientProps {
  initialPosts: Post[];
  displayName: string;
}

const HomeClient = ({ initialPosts, displayName }: HomeClientProps) => {
  const router = useRouter();
  const { theme, mounted } = useMountedTheme();

  if (!mounted) return null; // ✅ 다크모드 설정이 완료될 때까지 렌더링 지연

  return (
    <div
      className={`commonWrapper ${setThemeClass(
        theme,
        styles.darkPostWrapper,
        styles.postWrapper
      )}`}
    >
      <h1 className="commonTitle">최신 게시물</h1>
      <div className={`commonContent ${styles.postContent}`}>
        {initialPosts.length > 0 ? (
          initialPosts.map((post) => (
            <div key={post.id} className={styles.postItem}>
              <div className={styles.postImage}>
                <Image
                  alt={`${post.title} 이미지`}
                  src={post.imageUrl || "/images/default.jpeg"}
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
                onClick={() =>
                  router.push(`/blog/${displayName}/post/${post.id}`)
                }
                style={{ cursor: "pointer" }}
              >
                {post.title}
              </h2>
            </div>
          ))
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default HomeClient;
