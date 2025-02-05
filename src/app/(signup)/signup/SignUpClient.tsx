"use client";

import { auth, db, storage } from "@/firebase/config";
import { getUniqueBlogUrl } from "@/utils/blogUrlService";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import styles from "./SignUp.module.scss";

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

  useEffect(() => {
    if (email) {
      getUniqueBlogUrl(email).then(setBlogUrl);
    }
  }, [email]);

  // blogUrl 중복 확인
  const checkBlogUrlAvailability = async () => {
    if (!blogUrl) return;
    const userDocRef = doc(db, "users", blogUrl);
    const userDocSnap = await getDoc(userDocRef);
    setIsUrlAvailable(!userDocSnap.exists());
  };

  // 이메일 중복 확인 함수
  const checkEmailAvailability = async () => {
    try {
      console.log("email", email);
      const userDocRef = doc(db, "users", email);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setEmailAvailable(false);
        setError("이 이메일은 이미 사용 중입니다.");
      } else {
        setEmailAvailable(true);
        setError("");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError("이메일 중복 확인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!termsAgreed) {
      setError("서비스 이용약관에 동의해주세요.");
      return;
    } else if (!privacyAgreed) {
      setError("개인정보 이용약관에 동의해주세요.");
      return;
    } else {
      setError("모든 약관에 동의해야 합니다.");
    }

    if (!isUrlAvailable) {
      setError("이 블로그 주소는 이미 사용 중입니다.");
      return;
    }

    if (!emailAvailable) {
      setError("이메일을 확인해주세요.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("user:", user);

      // Firebase Storage에 프로필 이미지 업로드
      let profileImageUrl = "";
      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(snapshot.ref);
      }
      console.log("profileImageUrl:", profileImageUrl);

      await updateProfile(user, {
        displayName: nickName,
        photoURL: profileImageUrl,
      });

      // 이메일의 고유 이름 부분(@ 앞부분)을 blogUrl로 저장
      const blogUrl = await getUniqueBlogUrl(user.email!);

      await setDoc(doc(db, "users", user.uid), {
        nickName,
        profileImage: profileImageUrl,
        termsAgreed,
        privacyAgreed,
        agreedAt: new Date().toISOString(),
        blogUrl, // 이메일의 고유 이름 부분을 blogUrl로 저장
      });

      alert("회원가입이 완료되었습니다.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <div>
        <h1>회원가입</h1>
        <form onSubmit={handleSignup}>
          {/* 이메일 입력 */}
          <label>
            Email <b>*</b>
          </label>
          <input
            type="email"
            placeholder="이메일"
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={checkEmailAvailability} // 이메일 입력 후 중복 확인
            required
          />
          {error && !emailAvailable && (
            <div className="error" style={{ color: "#FF0000" }}>
              {error}
            </div>
          )}

          <label>
            비밀번호 <b>*</b>
          </label>
          <input
            type="password"
            placeholder="비밀번호"
            pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>
            비밀번호 확인 <b>*</b>
          </label>
          <input
            type="password"
            placeholder="비밀번호 확인"
            pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label>블로그 주소</label>
          <input
            type="text"
            value={blogUrl}
            onChange={(e) =>
              setBlogUrl(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))
            }
            onBlur={checkBlogUrlAvailability}
            required
            // 가상요소로 에러 메세지 세팅 후
            // 가상 요소의 부모요소의 class로 출력 여부 결정
            className={!isUrlAvailable ? styles.show : ""}
          />
          <label>
            닉네임 <b>*</b>
          </label>
          <input
            type="text"
            placeholder="닉네임"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
          <label>프로필 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfileImage(e.target.files[0]);
              }
            }}
          />
          <label>서비스 이용 약관</label>
          <div id="terms-content">
            <p>
              여기에 서비스 이용약관 내용을 넣습니다. 이 텍스트는 예시입니다.
            </p>
            <p>
              이용약관은 사용자가 서비스 이용 시 준수해야 할 규정을 설명합니다.
            </p>
            <p>약관 내용을 충분히 읽어보신 후 동의 체크를 해주세요.</p>
            <p>약관의 마지막 부분입니다.</p>
          </div>
          <div>
            <label htmlFor="terms-checkbox">
              서비스 이용약관에 동의합니다. <b>*</b>
            </label>
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              id="terms-checkbox"
              required
            />
          </div>

          <label>개인정보 이용 약관</label>
          <div id="privacy-content">
            <p>
              여기에 서비스 이용약관 내용을 넣습니다. 이 텍스트는 예시입니다.
            </p>
            <p>
              이용약관은 사용자가 서비스 이용 시 준수해야 할 규정을 설명합니다.
            </p>
            <p>약관 내용을 충분히 읽어보신 후 동의 체크를 해주세요.</p>
            <p>약관의 마지막 부분입니다.</p>
          </div>
          <div>
            <label htmlFor="privacy-checkbox">
              개인정보 수집 및 이용약관에 동의합니다. <b>*</b>
            </label>
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              id="privacy-checkbox"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="btns">
            <button type="submit">회원가입</button>
            <button type="button">취소</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignupClient;
