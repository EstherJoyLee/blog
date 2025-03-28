"use client";

import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./PostListClient.module.scss";
import Image from "next/image";
import { IPostState } from "@/types";
import dynamic from "next/dynamic";
import Loader from "@/components/loader/Loader";

interface PostListClientProps {
  initialPosts: IPostState[];
  displayName: string;
}

const MarkdownRenderer = dynamic(
  () => import("@/components/markdownRenderer/MarkdownRenderer"),
  {
    loading: () => <Loader />,
    ssr: false, // ✅ 클라이언트 전용 렌더링 (서버에서 제외)
  }
);

const PostListClient = ({ initialPosts, displayName }: PostListClientProps) => {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [lastVisibleId, setLastVisibleId] = useState(
    initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].id : null
  );
  const [hasMore, setHasMore] = useState(true); // ✅ 더 이상 불러올 게시물이 없으면 false로 설정
  const [openPostIds, setOpenPostIds] = useState<string[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { auth } = await import("@/firebase/config");
      const user = auth.currentUser;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (user) {
        const idToken = await user.getIdToken(); // ✅ 사용자 ID 토큰 가져오기
        // console.log("🔑 가져온 idToken:", idToken);

        // ✅ 서버에 ID 토큰을 보내 사용자 인증 확인
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const data = await response.json();
        if (data.uid) {
          setUserUid(data.uid); // ✅ 검증된 UID 저장
          // console.log("✅ 서버에서 검증된 UID:", data.uid);
        } else {
          console.warn("⚠️ 서버에서 인증되지 않은 사용자.");
        }
      }
    };

    checkAuth();
  }, []);

  const fetchMorePosts = async () => {
    if (loading || !hasMore || !lastVisibleId) return;
    setLoading(true);

    console.log("🚀 fetchMorePosts 실행됨");

    try {
      const { auth } = await import("@/firebase/config");

      const currentUser = auth.currentUser;
      const idToken = currentUser ? await currentUser.getIdToken() : null;
      const response = await fetch(
        `/api/posts?displayName=${displayName}&lastVisibleId=${lastVisibleId}&userUid=${userUid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: idToken ? `Bearer ${idToken}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.posts || !Array.isArray(data.posts)) {
        console.error("❌ API 응답 오류: data.posts가 유효하지 않음", data);
        return;
      }

      if (data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setLastVisibleId(data.lastVisibleDocId || null); // ✅ 마지막 문서 ID 업데이트
      } else {
        console.warn("⚠️ 더 이상 불러올 게시물이 없음");
        setHasMore(false); // ✅ 더 이상 불러올 게시물이 없으므로 버튼 숨기기
      }
    } catch (error) {
      console.error("❌ Error fetching more posts:", error);
    }

    setLoading(false); // ✅ 로딩 상태 해제
  };
  const handleView = (postId: string) => {
    router.push(`/blog/${displayName}/post/${postId}`);
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
        {posts.map((post) => {
          const togglePost = (id: string) => {
            setOpenPostIds((prev) =>
              prev.includes(id)
                ? prev.filter((pid) => pid !== id)
                : [...prev, id]
            );
          };

          return (
            <div key={post.id} className={styles.postListItem}>
              <h2 onClick={() => handleView(post.id)}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePost(post.id);
                  }}
                >
                  {openPostIds.includes(post.id) ? "▲" : "▼"}
                </span>
                {post.title}
              </h2>
              {openPostIds.includes(post.id) && (
                <div>
                  {post.imageUrl && (
                    <div
                      style={{ position: "relative", margin: "32px 0 36px" }}
                    >
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
              )}
            </div>
          );
        })}
        {hasMore && (
          <div className={styles.seeMoreBtn}>
            <button
              onClick={fetchMorePosts}
              disabled={loading}
              className={styles.loadMoreBtn}
              aria-label="더보기 버튼"
            >
              {loading ? "로딩 중..." : "더보기"}
            </button>
          </div>
        )}
      </div>

      {/* ✅ 더 이상 불러올 게시물이 없으면 버튼 숨기기 */}
    </div>
  );
};

export default PostListClient;
