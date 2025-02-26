"use client";

import Loader from "@/components/loader/Loader";
import { auth, db, googleProvider } from "@/firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUniqueBlogUrl } from "@/utils/blogUrlService";
import FormLayout from "@/components/FormLayout/FormLayout";
import Input from "@/components/FormLayout/Input/Input";
import CustomButton from "@/components/FormLayout/Button/Button";
import { FirebaseError } from "firebase/app";

const LoginClient = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // ✅ 블로그 URL로 리디렉션하는 함수
  const redirectUser = (blogUrl: string) => {
    router.push(`/blog/${blogUrl}`);
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

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("존재하지 않는 사용자입니다. 회원 가입 페이지로 이동합니다.");
        router.push("/signup");
      } else {
        const blogUrl = userSnap.data().blogUrl;
        setIsLoading(false);
        alert("로그인 성공!");
        redirectUser(blogUrl); // ✅ 로그인 성공 후 블로그 페이지로 이동
      }
    } catch (err) {
      setIsLoading(false);
      handleAuthError(err);
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let blogUrl = userSnap.exists() ? userSnap.data().blogUrl : null;

      if (!blogUrl) {
        blogUrl = await getUniqueBlogUrl(user.email!);
        await setDoc(userRef, { blogUrl }, { merge: true });
      }

      setIsLoading(false);
      alert(`로그인 성공! 블로그 주소: ${blogUrl}`);
      redirectUser(blogUrl); // ✅ 로그인 성공 후 블로그 페이지로 이동
    } catch (err) {
      setIsLoading(false);
      handleAuthError(err);
      router.push("/");
    }
  };

  // ✅ 공통 에러 처리 함수
  const handleAuthError = (err: unknown) => {
    const firebaseError = err as FirebaseError;
    switch (firebaseError.code) {
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
        console.error("로그인 에러:", firebaseError.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated as:", user.email);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <FormLayout title="로그인">
      {isLoading && <Loader />}
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isRequired
          label="Email"
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          isPassword
          isRequired
          label="비밀번호"
        />
        <CustomButton
          type="submit"
          variant="contained"
          color="primary"
          text="로그인"
        />
        <CustomButton
          type="button"
          variant="contained"
          color="primary"
          onClick={handleGoogleLogin}
          text="Google 로그인"
        />
      </form>
      {error && <p>{error}</p>}
    </FormLayout>
  );
};

export default LoginClient;
