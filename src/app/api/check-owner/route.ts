import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;
  const blogName = req.nextUrl.searchParams.get("blogName");

  if (!userId || !blogName) {
    return NextResponse.json({ isOwner: false }, { status: 400 });
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return NextResponse.json({ isOwner: false }, { status: 404 });
    }

    const userBlogUrl = userDocSnap.data().blogUrl;
    const isOwner = userBlogUrl === blogName;

    return NextResponse.json({ isOwner });
  } catch (error) {
    console.error("Firestore Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
