import { adminDB } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔹 모든 게시글 가져오기
    const postsSnapshot = await adminDB
      .collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    if (postsSnapshot.empty) {
      return new NextResponse("게시글이 없습니다.", { status: 404 });
    }

    const urls = [];

    // 🔹 각 게시글의 authorUid를 기반으로 users 컬렉션에서 blogUrl 가져오기
    for (const doc of postsSnapshot.docs) {
      const { createdAt, authorUid } = doc.data();

      // users 컬렉션에서 authorUid에 해당하는 사용자 찾기
      const userSnapshot = await adminDB
        .collection("users")
        .doc(authorUid)
        .get();

      if (!userSnapshot.exists) {
        console.warn(`⚠️ 사용자 정보를 찾을 수 없음 (authorUid: ${authorUid})`);
        continue;
      }

      const userData = userSnapshot.data();
      if (!userData) {
        console.warn(`⚠️ 사용자 정보를 찾을 수 없음 (authorUid: ${authorUid})`);
        continue;
      }
      const { blogUrl } = userData;

      // 🔹 XML 형태로 데이터 추가
      urls.push(`
        <url>
          <loc>https://joylog.vercel.app/blog/post/${blogUrl}/${doc.id}</loc>
          <lastmod>${new Date(createdAt.seconds * 1000).toISOString()}</lastmod>
        </url>
      `);
    }

    // 🔹 최종 Sitemap XML 생성
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join("\n")}
      </urlset>`;

    return new NextResponse(sitemap, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
