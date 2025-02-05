"use client";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.scss";
import Image from "next/image";
import {
  LOGIN,
  LOGOUT,
  selectIsLoggedIn,
  selectUserPhotoURL,
} from "@/redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { generateBlogUrl } from "@/utils/blogUrlService";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "next-themes";

const Header = () => {
  const dispatch = useDispatch();
  const [displayName, setDisplayName] = useState("");
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userPhotoURL = useSelector(selectUserPhotoURL);
  const [userBlogUrl, setUserBlogUrl] = useState("");
  const blogUrl = useGetBlogNameFromUrl();
  const { theme } = useTheme(); // 현재 테마 가져오기

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserBlogUrl(userData.blogUrl);
        }

        if (user.displayName === null) {
          const u1 = generateBlogUrl(user.email!) ?? "Unknown";
          const uName = u1.charAt(0).toUpperCase() + u1.slice(1);

          setDisplayName(uName);
        } else {
          setDisplayName(user.displayName);
        }

        //  유저 정보를 리덕스 스토어에 저장하기
        dispatch(
          LOGIN({
            email: user.email,
            userName: user.displayName ? user.displayName : displayName,
            userID: user.uid,
            userPhotoURL: user.photoURL,
          })
        );
      } else {
        setUserBlogUrl("");
        setDisplayName("");
        // 유저 정보를 리덕스 스토어에서 지우기
        dispatch(LOGOUT());
      }
    });
  }, [dispatch, displayName]);

  const logoutUser = () => {
    signOut(auth)
      .then(() => {
        alert("로그아웃 되었습니다.");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  //   if (pathname === "/login" || pathname === "/signup") {
  //     return null;
  //   }

  return (
    <header
      className={`${styles.header} ${
        theme === "dark" ? styles.darkHeader : ""
      }`}
    >
      <div className={styles.logo}>
        {!isLoggedIn ? (
          <Link href={"/"}>
            <h1>JoyLog</h1>
          </Link>
        ) : (
          <Link href={`/blog/${userBlogUrl}`} scroll={false}>
            <div className={styles.profileImage}>
              <Image
                alt="프로필 이미지"
                src={userPhotoURL || "/og_Image.gif"}
                layout="fill"
              />
            </div>

            <h1>{displayName}&#39;s JoyLog</h1>
          </Link>
        )}
      </div>
      {blogUrl ? (
        <nav className={styles.nav}>
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
      ) : (
        ""
      )}

      <div className={styles.loginBar}>
        <ul className={styles.list}>
          {!isLoggedIn ? (
            <>
              <li className={styles.item}>
                <Link href={"/login"}>로그인</Link>
              </li>
              <li className={styles.item}>
                <Link href="/signup">회원가입</Link>
              </li>
            </>
          ) : (
            <>
              <li className={styles.item}>
                <Link
                  href={"/"}
                  onClick={() => {
                    logoutUser();
                  }}
                >
                  로그아웃
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className={`${styles.item} ${styles.hambuger}`}>
          hambuger
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
