import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

export const runtime = "nodejs"; // Edge Runtime 문제 해결

export const POST = async (req: Request) => {
  try {
    console.log("📥 요청 수신:", req.method, req.headers.get("content-type"));
    if (req.headers.get("content-type") !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
      console.log("📦 요청 바디:", body);
    } catch (jsonError) {
      console.error("❌ JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { idToken } = body;
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    console.log("🔄 `idToken` 검증 시작...");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userUid = decodedToken.uid;

    console.log("✅ 검증된 `userUid`:", userUid);
    return NextResponse.json({ uid: userUid }, { status: 200 });
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};
