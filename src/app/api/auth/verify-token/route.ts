import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin"; // Firebase Admin SDK 사용

export const POST = async (req: Request) => {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // console.log("🔄 `idToken` 검증 시작...");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userUid = decodedToken.uid;

    // console.log("✅ 검증된 `userUid`:", userUid);
    return NextResponse.json({ uid: userUid }, { status: 200 });
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};
