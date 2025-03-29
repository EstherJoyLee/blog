"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import { useMountedTheme } from "@/hooks/useMountedTheme"; // 이미 사용 중인 훅

const ClientProgress = () => {
  const pathname = usePathname();
  const { theme, mounted } = useMountedTheme();

  useEffect(() => {
    if (!mounted) return;

    // 테마별 nprogress 색상 변경
    const bar = document.querySelector("#nprogress .bar") as HTMLElement | null;
    if (bar) {
      bar.style.backgroundColor = theme === "dark" ? "#00bfa5" : "#4fd1c5"; // 원하는 색상으로
    }

    NProgress.start();
    NProgress.set(0.3);

    const timeout = setTimeout(() => {
      NProgress.done();
    }, 100000);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [pathname, theme, mounted]);

  return null;
};

export default ClientProgress;
