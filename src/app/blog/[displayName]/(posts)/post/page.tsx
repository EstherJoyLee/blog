import PostListClient from "./PostListClient";
import { getPosts } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export const revalidate = 60; // ISR: 60초마다 정적 페이지 재생성

export const generateStaticParams = async () => {
  try {
    const { getUsersForStaticParams } = await import("@/lib/firebase/admin");
    return await getUsersForStaticParams();
  } catch (error) {
    console.error("❌ Error Fetching users for static paths: ", error);
    return [];
  }
};

// ✅ ISR을 적용한 페이지 컴포넌트
const PostPage = async ({
  params,
}: {
  params: Promise<{ displayName?: string }>;
}) => {
  const resolvedParams = await params; // ✅ params의 Promise를 해제
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ `params`가 정상적으로 들어왔는지 확인
  if (!resolvedParams || !resolvedParams.displayName) {
    console.error("❌ Error: params.displayName이 없습니다!", resolvedParams);
    return <p>잘못된 접근입니다.</p>;
  }

  console.log("📌 Resolved PostPage params:", resolvedParams);

  // ✅ 쿠키에서 `idToken` 가져오기 (클라이언트에서 로그인한 후 저장된 토큰)
  const cookiesData = await cookies();
  const idToken = cookiesData.get("idToken")?.value || null;
  let userUid = null;

  // ✅ 서버에서 Firebase Admin SDK를 사용하여 `idToken` 검증 후 `userUid` 가져오기
  if (idToken) {
    try {
      console.log("🔁 서버에서 `idToken` 검증 요청 시장...");
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      // console.log("✅ 서버 응답: ", data);

      if (data.uid) {
        userUid = data.uid; // ✅ 검증된 사용자 UID 저장
        // console.log("✅ 서버에서 검증된 userUid:", userUid);
      } else {
        console.warn("⚠️ `uid`가 서버 응답에서 없음: ", data);
      }
    } catch (error) {
      console.error("❌ 사용자 인증 오류:", error);
    }
  } else {
    console.warn("⚠️ `idToken`이 쿠키에서 존재하지 않음.");
  }

  // ✅ `userUid`를 `getPosts` 함수에 전달
  const posts = await getPosts(5, resolvedParams.displayName, userUid);
  return (
    <PostListClient
      initialPosts={posts}
      displayName={resolvedParams.displayName}
    />
  );
};

export default PostPage;
