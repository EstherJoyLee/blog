export const notifyGoogle = async () => {
  try {
    const sitemapUrl = encodeURIComponent(
      "https://joylog.vercel.app/api/sitemap"
    );
    const response = await fetch(
      `https://www.google.com/ping?sitemap=${sitemapUrl}`
    );

    if (response.ok) {
      console.log("✅ Google에 sitemap 갱신 요청 성공!");
    } else {
      console.warn("⚠️ Google sitemap 요청 실패:", response.status);
    }
  } catch (error) {
    console.error("❌ Google sitemap 요청 중 오류 발생:", error);
  }
};
