import HomeClient from "./HomeClient";
import { cookies } from "next/headers";

export const revalidate = 60; // ✅ 60초마다 ISR 적용

export const generateStaticParams = async () => {
  try {
    const { getUsersForStaticParams } = await import("@/lib/firebase/admin");
    return await getUsersForStaticParams();
  } catch (error) {
    console.error("❌ Error Fetching users for static paths: ", error);
    return [];
  }
};

const { getPosts } = await import("@/lib/firebase/admin");

const HomePage = async ({
  params,
}: {
  params: Promise<{ displayName?: string }>;
}) => {
  const resolvedParams = await params; // ✅ `params`를 `await`로 해제
  // console.log("📌 HomePage 실행 - params:", resolvedParams);

  if (!resolvedParams?.displayName) {
    console.error("❌ Error: params.displayName이 없습니다!", resolvedParams);
    return <p>잘못된 접근입니다.</p>;
  }

  const cookiesData = await cookies();
  const idToken = cookiesData.get("idToken")?.value || null;
  let userUid: string | null = null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // ✅ Firebase Admin SDK를 사용해 `idToken` 검증 후 `userUid` 가져오기
  if (idToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (data.uid) {
        userUid = data.uid;
        // console.log("✅ 서버에서 검증된 userUid:", userUid);
      }
    } catch (error) {
      console.error("❌ 사용자 인증 오류:", error);
    }
  } else {
    console.warn("⚠️ `idToken`이 쿠키에서 존재하지 않음.");
  }

  // console.log("🔍 최종 userUid: ", userUid);

  const posts = await getPosts(resolvedParams.displayName, userUid);

  return (
    <HomeClient initialPosts={posts} displayName={resolvedParams.displayName} />
  );
};

export default HomePage;
