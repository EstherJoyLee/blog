import { Space_Grotesk, Roboto, Noto_Sans_KR } from "next/font/google";

// 🌐 Space Grotesk (헤드라인용, 영문)
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

// 🌐 Roboto (본문용, 영문)
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-roboto",
});

// 🌐 Noto Sans KR (한글 본문용)
export const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-noto-sans-kr",
});
