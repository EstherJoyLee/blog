"use client";

import { auth, db } from "@/firebase/config";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import Button from "@mui/material/Button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FormLayout from "@/components/FormLayout/FormLayout";
import Input from "@/components/FormLayout/Input/Input";
import FolderSelect from "@/components/folders/FolderSelect";
import { selectFolderList } from "@/redux/slice/folderSlice";
import useFetchFolders from "@/hooks/useFetchFolders";
import { useParams } from "next/navigation";
import Loader from "@/components/loader/Loader";

const EditPostClient = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();

  const params = useParams(); // ✅ 클라이언트에서 params 가져오기
  const postId = params?.id as string;

  // ✅ 폴더 목록 가져오기
  useFetchFolders();
  const folders = useSelector(selectFolderList);

  // ✅ Firestore에서 기존 게시물 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        setTitle(postData.title);
        setContent(postData.content);
        setIsPublic(postData.isPublic);
        setSelectedFolder(postData.folderId || ""); // ✅ 기존 폴더 ID 설정
      } else {
        alert("게시물을 찾을 수 없습니다.");
      }
    };

    fetchPost();
  }, [postId]);

  // ✅ 게시물 수정 함수
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("사용자가 로그인하지 않았습니다.");
      }

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        title,
        content,
        isPublic,
        folderId: selectedFolder, // ✅ 폴더 선택 변경 사항 반영
        updatedAt: new Date(),
      });

      if (!title || !content) {
        alert("제목과 내용은 필수 입력 항목입니다.");
        setLoading(false);
        return;
      }
      alert("게시물이 성공적으로 수정되었습니다.");
      router.push(`/blog/${blogUrl}/post`);
    } catch (error) {
      console.error("게시물 수정 중 오류 발생:", error);
    } finally {
      setLoading(false);
      console.log("loading:", loading);
    }
  };

  const { mounted } = useMountedTheme();
  if (!mounted) {
    return null;
  } else if (!postId || typeof postId !== "string") {
    return <h1>잘못된 접근입니다.</h1>;
  }

  return (
    <FormLayout title="게시물 수정" isPost>
      {loading && <Loader />}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          isRequired
          label="제목 수정"
        />
        <Input
          type="text"
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          isRequired
          label="내용 수정"
        />

        <Input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic((e.target as HTMLInputElement).checked)}
          label="공개 여부 수정"
        />

        {/* ✅ 폴더 선택 UI 추가 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FolderSelect
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            folders={folders}
          />
        </div>

        <Button
          variant="contained"
          type="submit"
          aria-label="게시물 수정 완료 버튼"
        >
          수정
        </Button>
      </form>
    </FormLayout>
  );
};

export default EditPostClient;
