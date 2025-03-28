import { adminDB } from "@/firebase/admin";

export const getPosts = async (
  limit: number,
  displayName?: string,
  userUid?: string | null
) => {
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

    // console.log(
    //   `✅ isBlogOwner: ${isBlogOwner}, userUid: ${userUid}, authorUid: ${authorUid}`
    // );

    let postsQuery = adminDB
      .collection("posts")
      .where("authorUid", "==", authorUid)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (!isBlogOwner) {
      postsQuery = postsQuery.where("isPublic", "==", true); // ✅ 블로그 주인이 아니면 공개된 글만
    }

    const postSnapshot = await postsQuery.get();

    return postSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "제목 없음",
        content: data.content || "내용 없음",
        imageUrl: data.imageUrl || null,
        isPublic: data.isPublic || false,
        authorUid: data.authorUid || "",
        createdAt: data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : null,
        updatedAt: data.updatedAt
          ? new Date(data.updatedAt.seconds * 1000).toISOString()
          : null,
      };
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
};

export const getUsersForStaticParams = async () => {
  const userSnapshot = await adminDB.collection("users").get();
  return userSnapshot.docs
    .map((doc) => ({ displayName: doc.data().blogUrl || "" }))
    .filter((user) => user.displayName);
};
