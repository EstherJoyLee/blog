import { NextRequest, NextResponse } from "next/server";

// console.log("🤢😡😤 Middleware Loaded!");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userId = req.cookies.get("userId")?.value; // 🔥 userId 쿠키를 가져옴
  const pathSegments = pathname.split("/").filter(Boolean);

  // console.log(`[Middleware] 요청 URL: ${pathname}, userId: ${userId}`);

  if (
    pathSegments.length >= 3 &&
    pathSegments[0] === "blog" &&
    (pathSegments[2] === "edit" || pathSegments[2] === "create")
  ) {
    if (!userId) {
      // console.log(`[Middleware] 접근 차단 (로그인 필요) -> ${pathname}`);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // API Route를 호출하여 Firestore에서 owner 확인
    return fetch(
      `${req.nextUrl.origin}/api/check-owner?blogName=${pathSegments[1]}`,
      {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.isOwner) {
          // console.log(`[Middleware] 접근 차단 (잘못된 계정) -> ${pathname}`);
          return NextResponse.redirect(new URL("/not-allowed", req.url));
        }
        return NextResponse.next();
      })
      .catch((error) => {
        console.error("🔴 Middleware API Error:", error);
        return NextResponse.redirect(new URL("/not-allowed", req.url));
      });
  }

  return NextResponse.next();
}

// ✅ 미들웨어 적용할 경로 설정
export const config = {
  matcher: ["/blog/:path+/edit", "/blog/:path+/create"],
};
