import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  console.log(req.url);
  const blogName = searchParams.get("blogName");

  if (!blogName) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const q = query(collection(db, "users"), where("blogUrl", "==", blogName));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true });
};
