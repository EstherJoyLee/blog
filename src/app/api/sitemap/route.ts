// import { adminDB } from "@/firebase/admin";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const postsSnapshot = await adminDB
//       .collection("posts")
//       .orderBy("createdAt", "desc")
//       .get();

//     const urls = postsSnapshot.docs.map((doc) => {
//       const { createdAt, blogUrl } = doc.data();
//       return `
//         <url>
//           <loc>https://joylog.vercel.app/blog/${blogUrl}/${doc.id}</loc>
//           <lastmod>${new Date(createdAt.seconds * 1000).toISOString()}</lastmod>
//         </url>
//       `;
//     });

//     const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//       <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//         ${urls.join("\n")}
//       </urlset>`;

//     return new NextResponse(sitemap, {
//       headers: { "Content-Type": "application/xml" },
//     });
//   } catch (error) {
//     console.error("❌ Error generating sitemap:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
