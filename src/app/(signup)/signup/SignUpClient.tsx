"use client";

import { auth, db, storage } from "@/firebase/config";
import { getUniqueBlogUrl } from "@/utils/blogUrlService";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";
import styles from "./SignUp.module.scss";
import FormLayout from "@/components/FormLayout/FormLayout";
import Input from "@/components/FormLayout/Input/Input";
import TermsAgreement from "@/components/termsAgreement/TermsAgreement";
import CustomButton from "@/components/FormLayout/Button/Button";
import { useRouter } from "next/navigation";

const SignupClient = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickName, setNickName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [blogUrl, setBlogUrl] = useState("");
  const [isUrlAvailable, setIsUrlAvailable] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [blogUrlError, setBlogUrlError] = useState("");
  const router = useRouter();

  // blogUrl 중복 확인
  const checkBlogUrlAvailability = async () => {
    if (!blogUrl) return;

    const q = query(collection(db, "users"), where("blogUrl", "==", blogUrl));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setIsUrlAvailable(false);
      setBlogUrlError(
        "이미 존재하는 블로그 주소입니다. 다른 주소를 입력해주세요."
      );
    } else {
      setIsUrlAvailable(true);
      setBlogUrlError(""); // 중복이 없으면 에러 메시지 제거
    }
  };

  const checkEmailExistsInAuth = async (email: string) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setEmailAvailable(false);
        setEmailError("이 이메일은 이미 사용 중입니다.");
        return true;
      } else {
        setEmailAvailable(true);
        setEmailError("");
        return false;
      }
    } catch (err) {
      console.error("Firebase 이메일 중복 검사 오류:", err);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Firebase Authentication에서 이메일이 이미 있는지 검사
    const emailExists = await checkEmailExistsInAuth(email);
    if (emailExists) {
      setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
      return;
    }

    try {
      console.log("📌 회원가입 시도:", email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user) throw new Error("Firebase에서 사용자 생성에 실패했습니다.");
      console.log("✅ Firebase Authentication 등록 성공:", user.uid);

      // Firestore 저장 (실패 가능성 있음)
      try {
        console.log("📌 Firestore에 사용자 데이터 저장 시도...");

        await setDoc(doc(db, "users", user.uid), {
          email,
          nickName,
          termsAgreed,
          privacyAgreed,
          agreedAt: new Date().toISOString(),
          blogUrl: await getUniqueBlogUrl(user.email!),
          uid: user.uid,
        });

        console.log("✅ Firestore 저장 성공!");
      } catch (firestoreError) {
        console.error("🚨 Firestore 저장 실패:", firestoreError);

        // Firestore 저장 실패 시 Authentication에서 사용자 삭제
        await user.delete();
        console.error(
          "🗑️ Firestore 저장 실패로 인해 Authentication 사용자 삭제됨"
        );

        setError("회원가입 중 문제가 발생했습니다. 다시 시도해주세요.");
        return;
      }

      alert("회원가입이 완료되었습니다.");
      router.push(`/blog/${blogUrl}`);
    } catch (err: any) {
      console.error("🚨 Firebase 오류:", err.code, err.message);
      setError(err.message);
      alert(err.message);
    }
  };

  // 이메일 중복 확인 함수
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email) return;

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setEmailAvailable(false);
        setEmailError("이 이메일은 이미 사용 중입니다.");
      } else {
        setEmailAvailable(true);
        setEmailError(""); // 이메일 사용 가능 시 에러 제거
      }
    } catch (err) {
      setEmailError("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password: string) => {
    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordPattern.test(password)) {
      setPasswordError(
        "비밀번호는 최소 6자 이상, 영문, 숫자, 특수문자를 포함해야 합니다."
      );
    } else {
      setPasswordError("");
    }
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== password) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  useEffect(() => {
    if (email) {
      getUniqueBlogUrl(email).then(setBlogUrl);
    }

    if (blogUrl.length > 2) {
      checkBlogUrlAvailability();
    }
  }, [blogUrl, email]);

  return (
    <>
      <FormLayout title="회원가입">
        <form onSubmit={handleSignup}>
          {/* 이메일 입력 */}

          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);

              if (
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                  e.target.value
                )
              ) {
                checkEmailAvailability(e.target.value); // ✅ 이메일 형식이 올바르면 중복 검사 실행
              }
            }}
            label="Email"
            isRequired
            error={emailError}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            label="비밀번호"
            isRequired
            isPassword
            error={passwordError}
          />

          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
            label="비밀번호 확인"
            isRequired
            isPassword
            error={confirmPasswordError}
          />

          <Input
            label="블로그 주소"
            type="text"
            placeholder="블로그 주소"
            value={blogUrl}
            onChange={(e) => {
              const inputValue = e.target.value;
              const sanitizedValue = inputValue.replace(/[^a-z0-9-]/g, "");

              if (inputValue !== sanitizedValue) {
                setBlogUrlError(
                  "블로그 주소에는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다."
                );
              } else {
                setBlogUrlError("");
              }

              setBlogUrl(sanitizedValue); // ✅ 입력 값이 바뀌면 useEffect에서 즉시 중복 검사 실행
            }}
            // onBlur={checkBlogUrlAvailability}
            isRequired
            error={blogUrlError}
          />

          <Input
            label="닉네임"
            type="text"
            placeholder="닉네임"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            isRequired
          />
          {/* 
          <Input
            label="프로필 이미지"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfileImage(e.target.files[0]);
              }
            }}
          /> */}
          <TermsAgreement
            termsAgreed={termsAgreed}
            setTermsAgreed={setTermsAgreed}
            privacyAgreed={privacyAgreed}
            setPrivacyAgreed={setPrivacyAgreed}
          />

          <div className="commonBtns">
            <CustomButton
              text="회원가입"
              variant="contained"
              color="primary"
              type="submit"
            />
            <CustomButton
              text="취소"
              variant="outlined"
              color="primary"
              type="button"
            />
          </div>
        </form>
      </FormLayout>
    </>
  );
};

export default SignupClient;
