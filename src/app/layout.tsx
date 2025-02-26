import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/layouts/header/Header";
import Providers from "@/redux/Providers";
import Footer from "@/layouts/footer/Footer";
// import { spaceGrotesk, roboto, notoSansKR } from "@/styles/font";
import Content from "@/components/content/Content";
import ThemeToggle from "@/components/themeToggleBtn/ThemeToggleBtn";

export const metadata: Metadata = {
  // ✅ 기본 정보 (SEO 최적화)
  title: "JoyLog - Dev & Life Blog",
  description: "PinkRabbit이 만든 개발 및 라이프 블로그. 최신 기술과 개발 일상을 공유합니다.",



  // ✅ Robots (검색 엔진 크롤링 제어)
  robots: {
    index: true, // 🔹 검색 엔진 색인 허용
    follow: true, // 🔹 링크 따라가기 허용
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}
      >
        {/* <CheckError /> */}
        <div id="wrap">
          <Providers>
            <Header />
            <Content>{children}</Content>
            <ThemeToggle />
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
