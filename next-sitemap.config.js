/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://joylog.vercel.app",
  generateRobotsTxt: true, // robots.txt 자동 생성
  exclude: ["/admin"], // 제외할 페이지 설정
};
