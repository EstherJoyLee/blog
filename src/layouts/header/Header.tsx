"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import styles from "./Header.module.scss";
import { auth, db } from "@/firebase/config";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { generateBlogUrl } from "@/utils/blogUrlService";
import {
  LOGIN,
  LOGOUT,
  selectIsLoggedIn,
  selectUserPhotoURL,
} from "@/redux/slice/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const blogUrl = useGetBlogNameFromUrl();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userPhotoURL = useSelector(selectUserPhotoURL);

  const [userBlogUrl, setUserBlogUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, mounted } = useMountedTheme();

  // ✅ Auth 상태 구독 (지연 처리 + 상태 최소화)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        dispatch(LOGOUT());
        setUserBlogUrl("");
        return;
      }

      // 🔁 Firebase 비동기 연산은 microtask로 넘기기
      setTimeout(async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserBlogUrl(data.blogUrl);
          }

          const fallbackName = generateBlogUrl(user.email!) ?? "Unknown";
          const userName =
            user.displayName ||
            fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

          dispatch(
            LOGIN({
              email: user.email,
              userName,
              userID: user.uid,
              userPhotoURL: user.photoURL,
            })
          );
        } catch (error) {
          console.error("🔥 Header Firestore Error:", error);
        }
      }, 0);
    });

    return () => unsub();
  }, [dispatch]);

  // ✅ displayName 캐싱
  const displayName = useMemo(() => {
    const user = auth.currentUser;
    if (!user) return "";

    if (user.displayName) return user.displayName;

    const fallback = generateBlogUrl(user.email!) ?? "Unknown";
    return fallback.charAt(0).toUpperCase() + fallback.slice(1);
  }, [auth.currentUser]);

  // ✅ CSS 클래스 캐싱
  const headerClass = useMemo(() => {
    return setThemeClass(theme, styles.darkHeader, styles.header);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      <header className={headerClass}>
        <div className={styles.logo}>
          {!isLoggedIn ? (
            <Link href={"/"}>
              <h1>JoyLog</h1>
            </Link>
          ) : (
            <Link href={`/blog/${userBlogUrl}`} scroll={false}>
              <div
                className={styles.profileImage}
                style={{ width: "32px", height: "32px" }}
              >
                <Image
                  alt="프로필 이미지"
                  src={userPhotoURL || "/images/og_Image.gif"}
                  width={32}
                  height={32}
                  priority
                />
              </div>
              <h1>{displayName}&#39;s JoyLog</h1>
            </Link>
          )}
        </div>

        {blogUrl && (
          <nav className={`${styles.nav} ${menuOpen ? styles.active : ""}`}>
            <ul>
              <li>
                <Link href={`/blog/${blogUrl}`} scroll={false}>
                  Home
                </Link>
              </li>
              <li>
                <Link href={`/blog/${blogUrl}/post`} scroll={false}>
                  Posts
                </Link>
              </li>
              <li>
                <Link href={`/blog/${blogUrl}/contact`} scroll={false}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        )}

        <div className={styles.loginBar}>
          <ul className={styles.list}>
            {!isLoggedIn ? (
              <>
                <li className={styles.item}>
                  <Link href="/login">로그인</Link>
                </li>
                <li className={styles.item}>
                  <Link href="/signup">회원가입</Link>
                </li>
              </>
            ) : (
              <li className={styles.item}>
                <Link href="/" onClick={logoutUser}>
                  로그아웃
                </Link>
              </li>
            )}
          </ul>

          <div
            id="hamburger"
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      <div
        id={styles.deemedWrapper}
        className={`${menuOpen ? styles.active : ""}`}
      />
    </>
  );
};

const logoutUser = () => {
  signOut(auth)
    .then(() => alert("로그아웃 되었습니다."))
    .catch((error) => console.log(error.message));
};

export default Header;
