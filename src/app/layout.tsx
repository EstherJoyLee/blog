import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/layouts/header/Header";
import Providers from "@/redux/Providers";
import Footer from "@/layouts/footer/Footer";
import Aside from "@/layouts/aside/Aside";
import ThemeToggle from "@/components/themeToggleBtn/ThemeToggleBtn";
import { spaceGrotesk, roboto, notoSansKR } from "@/styles/font";

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
        className={`${spaceGrotesk.className} ${roboto.className} ${notoSansKR.className} bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}
      >
        {/* <CheckError /> */}

        <Providers>
          <Header />
          <main>
            <Aside />

            {children}
            <ThemeToggle />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
