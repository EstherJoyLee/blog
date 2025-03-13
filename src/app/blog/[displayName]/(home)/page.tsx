import { adminDB } from "@/firebase/admin";
import HomeClient from "./HomeClient";
import { cookies } from "next/headers";

export const revalidate = 60; // ✅ 60초마다 ISR 적용

export const generateStaticParams = async () => {
  try {
    const userSnapshot = await adminDB.collection("users").get();

    const users = userSnapshot.docs
      .map((doc) => ({
        displayName: doc.data().blogUrl || "", // ✅ blogUrl 필드 가져오기
      }))
      .filter((user) => user.displayName); // ✅ 빈 값 제거

    console.log("📌 generateStaticParams - 생성된 경로: ", users);
    return users;
  } catch (error) {
    console.error("❌ Error Fetching users for static paths: ", error);
    return [];
  }
};

const getPosts = async (displayName?: string, userUid?: string | null) => {
  console.log(
    "📌 getPosts 실행 - displayName:",
    displayName,
    "userUid:",
    userUid
  );

  if (!displayName) {
    console.error("❌ Error: displayName 값이 없습니다!");
    return [];
  }

  try {
    const userSnapshot = await adminDB
      .collection("users")
      .where("blogUrl", "==", displayName)
      .get();

    if (userSnapshot.empty) {
      console.warn("⚠️ 해당 블로그 사용자가 없음:", displayName);
      return [];
    }

    const authorUid = userSnapshot.docs[0].id;
    const isBlogOwner = userUid === authorUid; // ✅ 블로그 주인 여부 확인

    console.log(
      `✅ isBlogOwner: ${isBlogOwner}, userUid: ${userUid}, authorUid: ${authorUid}`
    );

    let postsQuery = adminDB
      .collection("posts")
      .where("authorUid", "==", authorUid)
      .orderBy("createdAt", "desc")
      .limit(10);

    if (!isBlogOwner) {
      postsQuery = postsQuery.where("isPublic", "==", true); // ✅ 블로그 주인이 아니면 공개된 글만
    }

    const postSnapshot = await postsQuery.get();

    return postSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || "제목 없음",
      content: doc.data().content || "내용 없음",
      imageUrl: doc.data().imageUrl || null,
      isPublic: doc.data().isPublic || false,
      createdAt: doc.data().createdAt?.seconds
        ? new Date(doc.data().createdAt.seconds * 1000).toISOString()
        : null,
    }));
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ displayName?: string }>;
}) {
  const resolvedParams = await params; // ✅ `params`를 `await`로 해제
  console.log("📌 HomePage 실행 - params:", resolvedParams);

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
        console.log("✅ 서버에서 검증된 userUid:", userUid);
      }
    } catch (error) {
      console.error("❌ 사용자 인증 오류:", error);
    }
  } else {
    console.warn("⚠️ `idToken`이 쿠키에서 존재하지 않음.");
  }

  console.log("🔍 최종 userUid: ", userUid);

  const posts = await getPosts(resolvedParams.displayName, userUid);

  return (
    <HomeClient initialPosts={posts} displayName={resolvedParams.displayName} />
  );
}
