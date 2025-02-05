"use client";

import { auth, db } from "@/firebase/config";
import uploadImage from "@/utils/uploadImage";
import { Button } from "@mui/material";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const ProfileClient = () => {
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null); // user 상태 추가

  console.log(JSON.stringify(user));
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // user 객체 업데이트
        setEmail(currentUser.email || "");
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || null);
      } else {
        setUser(null);
      }
    });

    // 클린업 함수로 리스너 제거
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    setIsLoading(true);

    try {
      if (!user) {
        setError("사용자가 로그인되지 않았습니다.");
        return;
      }

      // 프로필 사진이 있다면 업로드하고 URL 업데이트
      if (newPhoto) {
        const uploadedPhotoURL = await uploadImage(
          newPhoto,
          "profileImage",
          "images/"
        );
        await updateProfile(user, { photoURL: uploadedPhotoURL });
        setPhotoURL(uploadedPhotoURL);
      }

      // 이름이 변경되었으면 업데이트
      if (newDisplayName) {
        await updateProfile(user, { displayName: newDisplayName });
        setDisplayName(newDisplayName);
      }

      // Firestore에서 사용자 이름 업데이트
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: newDisplayName || user.displayName,
      });

      setError(null);
      alert("프로필이 성공적으로 업데이트되었습니다.");
      setNewDisplayName(""); // 새 이름 초기화
      setNewPhoto(null); // 새 이미지 초기화
    } catch (error) {
      setError("프로필 업데이트 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewPhoto(file);
    }
  };

  return (
    <div>
      <h1>사용자 프로필</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <p>이메일: {email}</p>
        <p>이름: {displayName}</p>
        <div>
          <label>프로필 사진:</label>
          {photoURL ? (
            <img src={photoURL} alt="프로필 사진" width={100} height={100} />
          ) : (
            <p>사진 없음</p>
          )}
          <input type="file" onChange={handleImageChange} />
        </div>
        <div>
          <label>새 이름:</label>
          <input
            type="text"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
        </div>
        <Button
          variant="contained"
          onClick={handleUpdateProfile}
          disabled={isLoading}
        >
          {isLoading ? "업데이트 중..." : "프로필 업데이트"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileClient;
