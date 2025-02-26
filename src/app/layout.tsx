import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/layouts/header/Header";
import Providers from "@/redux/Providers";
import Footer from "@/layouts/footer/Footer";
// import { spaceGrotesk, roboto, notoSansKR } from "@/styles/font";
import Content from "@/components/content/Content";
import ThemeToggle from "@/components/themeToggleBtn/ThemeToggleBtn";

export const metadata: Metadata = {
  title: "JoyLog",
  description: "Blog Web Application which Generated PinkRabbit",
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
