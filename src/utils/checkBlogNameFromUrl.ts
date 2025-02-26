"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useGetBlogNameFromUrl = () => {
  const pathname = usePathname();
  const [blogName, setBlogName] = useState("");

  useEffect(() => {
    // console.log("🔄 Pathname changed: ", pathname);
    const newBlogName = pathname.split("/")[2] || "";
    setBlogName(newBlogName);
  }, [pathname]); // ✅ pathname이 바뀔 때마다 실행됨

  return blogName;
};
