import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/layouts/header/Header";
import Providers from "@/redux/Providers";
import Footer from "@/layouts/footer/Footer";
// import { spaceGrotesk, roboto, notoSansKR } from "@/styles/font";
import Content from "@/components/content/Content";
import ThemeToggle from "@/components/themeToggleBtn/ThemeToggleBtn";

export const metadata: Metadata = {
  title: "JoyLog - Dev & Life Blog",
  description:
    "PinkRabbit이 만든 개발 및 라이프 블로그. 최신 기술과 개발 일상을 공유합니다.",

  openGraph: {
    title: "JoyLog - Dev & Life Blog",
    description:
      "PinkRabbit이 만든 개발 및 라이프 블로그. 최신 기술과 개발 일상을 공유합니다.",
    url: "https://joylog.vercel.app/",
    siteName: "JoyLog",
    images: [
      {
        url: "https://joylog.vercel.app/images/og_image.gif", // Open Graph 이미지 URL
        width: 1200,
        height: 630,
        alt: "JoyLog 블로그 미리보기 이미지",
      },
    ],
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-icon-60x60.png",
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
