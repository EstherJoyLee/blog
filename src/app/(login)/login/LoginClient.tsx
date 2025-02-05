"use client";

import Loader from "@/components/loader/Loader";
import { auth, db, googleProvider } from "@/firebase/config";
import { Button } from "@mui/material";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Login.module.scss";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUniqueBlogUrl } from "@/utils/blogUrlService";

const LoginClient = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const redirectUser = () => {
    router.push("/");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Authenticated as:", user?.email);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("존재하지 않는 사용자입니다. 회원 가입 페이지로 이동합니다.");
      }
      setIsLoading(false);
      alert("로그인 성공");
      // redirectUser();
    } catch (err: any) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/invalid-credential":
          setError("유효하지 않은 이메일 또는 비밀번호 입니다.");
          break;
        case "auth/missing-email":
          setError("이메일을 입력해주세요.");
          break;
        case "auth/missing-password":
          setError("비밀번호를 입력해주세요.");
          break;
        case "auth/invalid-email":
          setError("올바른 이메일 형식이 아닙니다.");
          break;
        case "auth/user-not-found":
          setError("존재하지 않는 계정입니다.");
          break;
        case "auth/wrong-password":
          setError("비밀번호가 틀렸습니다. 다시 입력해주세요.");
          break;
        case "auth/too-many-requests":
          setError("너무 많은 요청으로 인해 계정이 일시적으로 차단되었습니다.");
          break;
        default:
          setError("");
          console.error("Loing error:", err.message);
      }
    }
  };

  const handleGoggleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Google 로그인 시 고유한 blogUrl 생성

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data()?.blogUrl) {
        const blogUrl = await getUniqueBlogUrl(user.email!);
        await setDoc(
          userRef,
          {
            email: user.email,
            displayName: user.displayName || "Unknown",
            photoURL: user.photoURL || "",
            uid: user.uid,
            blogUrl,
          },
          { merge: true }
        );
        setIsLoading(false);
        alert(`로그인 성공!\n블로그 주소는 ${blogUrl}입니다.`);
      } else {
        setIsLoading(false);
        alert("로그인 성공!");
      }

      redirectUser();
    } catch (err: any) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/invalid-credential":
          setError("유효하지 않은 이메일 또는 비밀번호 입니다.");
          break;
        case "auth/missing-email":
          setError("이메일을 입력해주세요.");
          break;
        case "auth/missing-password":
          setError("비밀번호를 입력해주세요.");
          break;
        case "auth/invalid-email":
          setError("올바른 이메일 형식이 아닙니다.");
          break;
        case "auth/user-not-found":
          setError("존재하지 않는 계정입니다.");
          break;
        case "auth/wrong-password":
          setError("비밀번호가 틀렸습니다. 다시 입력해주세요.");
          break;
        case "auth/too-many-requests":
          setError("너무 많은 요청으로 인해 계정이 일시적으로 차단되었습니다.");
          break;
        default:
          setError("");
          console.error("Loing error:", err.message);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated as:", auth.currentUser);
      } else {
        console.log("No user is authenticated");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={styles.page}>
      {isLoading && <Loader />}
      <h1>로그인</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          로그인
        </Button>
      </form>
      <div className={styles.buttonGroup}>
        <Button variant="contained" color="primary" onClick={handleGoggleLogin}>
          Google 로그인
        </Button>
      </div>

      {error && <p>{error}</p>}
    </div>
  );
};
export default LoginClient;
