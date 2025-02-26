"use client";

import Aside from "@/layouts/aside/Aside";
import { usePathname } from "next/navigation";
import Main from "@/app/main/Main";
import styles from "./Content.module.scss";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";

export default function Content({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // "/blog/블로그이름" 패턴을 확인 (즉, "/blog"로 시작하면서 "/"가 하나 더 있는 경우만 예외 처리)
  const isBlogWithName = /^\/blog\/[^/]+/.test(pathname);

  // "/blog/blogName" 형식이 아니면 noAside 추가 (사이드바 X)
  const shouldAddNoAside = !isBlogWithName;

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return;
  }

  return (
    <>
      {pathname !== "/" ? (
        <main
          className={setThemeClass(
            theme,
            styles.darkBlogMain,
            `${styles.blogMain} ${shouldAddNoAside ? styles.noAside : ""}`
          )}
        >
          <Aside />
          {children}
        </main>
      ) : (
        <Main />
      )}
    </>
  );
}
