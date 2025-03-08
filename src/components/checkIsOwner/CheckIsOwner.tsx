"use client";

import { auth, db } from "@/firebase/config";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import CheckError from "../error/CheckError";
import Cookies from "js-cookie";

interface IIsOwnerContextType {
  isOwner: boolean;
}

const IsOwnerContext = createContext<IIsOwnerContextType | undefined>(
  undefined
);

const CheckIsOwnerProvider = ({ children }: { children: React.ReactNode }) => {
  const blogNameFromUrl = useGetBlogNameFromUrl();

  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const [userBlogUrl, setUserBlogUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserBlogUrl(userData.blogUrl);
        }
      } else {
        setUserBlogUrl(null);
      }

      if (!user) {
        // console.log("🔴 로그아웃 감지: 쿠키 제거");
        Cookies.remove("isOwner");
        Cookies.remove("userId");
        setIsOwner(false);
        return;
      }

      const userId = user.uid;
      Cookies.set("userId", userId, { path: "/" });

      try {
        if (!blogNameFromUrl || blogNameFromUrl.trim() === "") {
          console.error("🚨 blogNameFromUrl is undefined or empty!");
          return;
        }
        const res = await fetch(`/api/check-owner?blogName=${blogNameFromUrl}`);

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        setIsOwner(data.isOwner);

        if (isOwner) {
          Cookies.set("isOwner", "true", { path: "/" });
        } else {
          Cookies.remove("isOwner");
        }
      } catch (error) {
        console.error("🔴 API Error:", error);
        setIsOwner(false);
        Cookies.remove("isOwner");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, blogNameFromUrl]);

  useEffect(() => {
    // console.log(
    //   `🔍 Comparing userBlogUrl(${userBlogUrl}) === blogNameFromUrl(${blogNameFromUrl})`
    // );
    if (userBlogUrl === blogNameFromUrl) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [userBlogUrl, blogNameFromUrl]);

  useEffect(() => {
    document.body.classList.remove("owner");

    if (isOwner) {
      document.body.classList.add("owner");
    } else {
    }
  }, [isOwner]);

  return (
    <>
      <CheckError blogName={blogNameFromUrl || ""} />
      <IsOwnerContext.Provider value={{ isOwner }}>
        {children}
      </IsOwnerContext.Provider>
    </>
  );
};

export const useIsOwner = () => {
  const context = useContext(IsOwnerContext);
  if (!context) {
    throw new Error("useIsOwner must be used within an OwnerProvider");
  }
  return context;
};

export default CheckIsOwnerProvider;
