"use client";

import { auth, db } from "@/firebase/config";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setPublicUrl } from "@/redux/slice/imageSlice";
import { supabase } from "@/supabase/config";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import uploadImage from "@/utils/uploadImage";
import { Button } from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const dispatch = useDispatch();
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
        setCurrentImageUrl(postData.imageUrl);
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

      let imageUrl = currentImageUrl; // 기존 이미지 유지
      if (image) {
        const uploadedUrl = await uploadImage(image, "postImages", "images/");
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          dispatch(setPublicUrl(imageUrl));
        }
      }

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        title,
        content,
        imageUrl,
        isPublic,
        folderId: selectedFolder, // ✅ 폴더 선택 변경 사항 반영
        updatedAt: new Date(),
      });

      if (!title || !content) {
        alert("제목과 내용은 필수 입력 항목입니다.");
        setLoading(false);
        return;
      }
      if (image && !imageUrl) {
        alert("이미지를 업로드해 주세요.");
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

  // ✅ 이미지 삭제 기능
  const handleDeleteImage = async () => {
    if (!currentImageUrl) {
      alert("삭제할 이미지가 없습니다.");
      return;
    }

    try {
      const imagePath = currentImageUrl.replace(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`,
        ""
      );

      const { error } = await supabase.storage
        .from("postImages")
        .remove([imagePath]);

      if (error) {
        console.error("이미지 삭제 오류: ", error);
        alert("이미지 삭제에 실패했습니다.");
        return;
      }

      setCurrentImageUrl("");
      alert("이미지가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("이미지 삭제 중 오류 발생: ", error);
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
          type="file"
          label="이미지 수정"
          isEditMode={true} // ✅ 수정 모드일 때만 동작
          currentImageUrl={currentImageUrl} // ✅ 현재 이미지 URL
          setImage={setImage} // ✅ 이미지 변경 핸들러
          handleDeleteImage={handleDeleteImage} // ✅ 이미지 삭제 핸들러
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

        <Button variant="contained" type="submit">
          수정
        </Button>
      </form>
    </FormLayout>
  );
};

export default EditPostClient;
