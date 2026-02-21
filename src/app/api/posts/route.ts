import { NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin"; // ✅ Firebase Admin SDK 사용

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const displayName = searchParams.get("displayName");
    const userUid = searchParams.get("userUid");
    const lastVisibleId = searchParams.get("lastVisibleId");

    if (!displayName) {
      console.error("❌ Error: displayName이 없습니다.");
      return NextResponse.json(
        { error: "Missing displayName" },
        { status: 400 }
      );
    }

    // ✅ 블로그 주인의 UID 조회
    const userSnapshot = await adminDB
      .collection("users")
      .where("blogUrl", "==", displayName)
      .get();

    if (userSnapshot.empty) {
      console.warn("⚠️ displayName을 가진 사용자가 없음:", displayName);
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const authorUid = userSnapshot.docs[0].id;
    const isBlogOwner = userUid === authorUid; // ✅ 서버에서 userUid 검증

    let postsQuery = adminDB
      .collection("posts")
      .where("authorUid", "==", authorUid)
      .orderBy("createdAt", "desc")
      .limit(5);

    // ✅ 블로그 주인이 아니라면 공개 게시물만 가져오기
    if (!isBlogOwner) {
      postsQuery = postsQuery.where("isPublic", "==", true);
    }

    if (lastVisibleId) {
      const lastDocSnap = await adminDB
        .collection("posts")
        .doc(lastVisibleId)
        .get();
      if (lastDocSnap.exists) {
        postsQuery = postsQuery.startAfter(lastDocSnap);
      } else {
        console.warn("⚠️ lastVisibleId에 해당하는 문서 없음:", lastVisibleId);
      }
    }

    const postSnapshot = await postsQuery.get();
      const posts = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "제목 없음",
        content: doc.data().content || "내용 없음",
        isPublic: doc.data().isPublic || false,
        authorUid: doc.data().authorUid || "",
      createdAt: doc.data().createdAt
        ? new Date(doc.data().createdAt.seconds * 1000).toISOString()
        : null,
      updatedAt: doc.data().updatedAt
        ? new Date(doc.data().updatedAt.seconds * 1000).toISOString()
        : null,
    }));

    return NextResponse.json(
      {
        posts,
        lastVisibleDocId:
          postSnapshot.docs.length > 0
            ? postSnapshot.docs[postSnapshot.docs.length - 1].id
            : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ 서버 내부 오류 발생:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
