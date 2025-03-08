"use client";

import { useEffect } from "react";
import { auth } from "@/firebase/config"; // ✅ Firebase 클라이언트 SDK 불러오기
import Cookies from "js-cookie"; // ✅ 쿠키 저장 라이브러리

const AuthProvider = () => {
  useEffect(() => {
    const storeIdTokenInCookies = async () => {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken(); // ✅ Firebase에서 `idToken` 가져오기
        console.log("🔑 저장된 idToken:", idToken);

        // ✅ 쿠키에 `idToken` 저장 (1일 동안 유지)
        Cookies.set("idToken", idToken, {
          expires: 1,
          secure: true,
          sameSite: "Strict",
        });
      }
    };

    // ✅ 로그인 상태가 변경될 때 실행
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        storeIdTokenInCookies(); // ✅ 로그인하면 `idToken`을 쿠키에 저장
      } else {
        Cookies.remove("idToken"); // ✅ 로그아웃하면 `idToken` 삭제
      }
    });

    // ✅ `idToken`이 변경될 때 실행 (토큰 자동 갱신)
    const unsubscribeToken = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken(true); // ✅ 강제 갱신
        Cookies.set("idToken", idToken, {
          expires: 1,
          secure: true,
          sameSite: "Strict",
        });
      } else {
        Cookies.remove("idToken");
      }
    });

    return () => {
      unsubscribeAuth(); // ✅ 리스너 정리
      unsubscribeToken(); // ✅ 리스너 정리
    };
  }, []);

  return null; // ✅ UI를 렌더링하지 않음 (전역 상태 관리 역할)
};

export default AuthProvider;
