// "use client";

// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";

// export const useGetBlogNameFromUrl = () => {
//   const pathname = usePathname();
//   const [blogName, setBlogName] = useState("");

//   useEffect(() => {
//     // console.log("🔄 Pathname changed: ", pathname);
//     const newBlogName = pathname.split("/")[2] || "";
//     setBlogName(newBlogName);
//   }, [pathname]); // ✅ pathname이 바뀔 때마다 실행됨

//   return blogName;
// };
"use client";

import { usePathname } from "next/navigation";

export const useGetBlogNameFromUrl = () => {
  const pathname = usePathname();

  // ✅ 안전하게 blogName 추출
  const pathSegments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
  const blogName = pathSegments.length > 1 ? pathSegments[1] : ""; // `/blog/이름` 구조 가정

  return blogName;
};
