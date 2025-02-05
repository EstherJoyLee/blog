"use client";

import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import uploadImage from "@/utils/uploadImage";
import { useDispatch, useSelector } from "react-redux";
import { setPublicUrl } from "@/redux/slice/imageSlice";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { selectFolderList } from "@/redux/slice/folderSlice";
import Folder from "@/components/folder/Folder";
import useFetchFolders from "@/hooks/useFetchFolders";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";

const CreatePostClient = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const blogUrl = useGetBlogNameFromUrl();

  // Redux에서 폴더 목록 가져오기
  useFetchFolders();
  const dispatch = useDispatch();
  const router = useRouter();
  const folders = useSelector(selectFolderList);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("사용자가 로그인하지 않았습니다.");
      }

      let imageUrl = null;
      if (image) {
        // 이미지 업로드 실행
        const uploadedUrl = await uploadImage(image, "postImages", "images/");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          dispatch(setPublicUrl(imageUrl));
        }
      }

      // Firestore에 게시물 저장
      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageUrl,
        isPublic,
        folderId: selectedFolder, // 선택한 폴더 ID 저장
        createdAt: new Date(),
        authorUid: user.uid, // 게시물 작성자의 UID 저장
      });

      if (!title || !content) {
        alert("제목과 내용은 필수 입력 항목입니다.");
        return;
      }

      if (image && !imageUrl) {
        alert("이미지를 업로드해 주세요.");
        return;
      }

      alert("게시물이 성공적으로 작성되었습니다.");
      router.push(`/blog/${blogUrl}/post`);
    } catch (error) {
      console.error("게시물 작성 중 오류:", error);
    }
  };

  return (
    <>
      <h1>게시물 작성</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImage(file); // 상태 업데이트
          }}
        />
        <label>공개 여부:</label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <div>
          <label>폴더 선택:</label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            required
          >
            <option value="">폴더를 선택하세요</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <Folder folders={folders} />
        </div>
        <Button type="submit">작성</Button>
      </form>
    </>
  );
};

export default CreatePostClient;
