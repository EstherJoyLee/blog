import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

const useCurrentUserUid = () => {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        setCurrentUserUid(null); // 로그인되지 않은 경우
      }
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 제거
  }, []);

  return currentUserUid;
};

export default useCurrentUserUid;
