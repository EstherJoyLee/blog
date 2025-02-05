"use client";

import { auth, db } from "@/firebase/config";
import { setPublicUrl } from "@/redux/slice/imageSlice";
import { supabase } from "@/supabase/config";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import uploadImage from "@/utils/uploadImage";
import { Button } from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const EditPostClient = ({ postId }: { postId: string }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const blogUrl = useGetBlogNameFromUrl();

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
      } else {
        alert("게시물을 찾을 수 없습니다.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !content) {
      alert("제목과 내용은 필수 입력 항목입니다.");
      return;
    }
    if (image && !currentImageUrl) {
      alert("이미지를 업로드해 주세요.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("사용자가 로그인하지 않았습니다.");
      }

      let imageUrl = currentImageUrl; // 기존 이미지를 유지
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
        updatedAt: new Date(),
      });

      alert("게시물이 성공적으로 수정되었습니다.");
      router.push(`/blog/${blogUrl}/post`); // 게시물 목록 페이지로 리디렉션
    } catch (error) {
      console.error("게시물 수정 중 오류 발생:", error);
    }
  };

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

  return (
    <>
      <h1>게시물 수정</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>제목</label>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>내용</label>
          <textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label>이미지 수정</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          {currentImageUrl ? (
            <div>
              <Image
                alt={`${title} 이미지`}
                src={currentImageUrl}
                width={300}
                height={200}
                style={{ objectFit: "cover" }}
              />
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteImage}
              >
                이미지 삭제
              </Button>
            </div>
          ) : (
            <p>이미지를 불러올 수 없습니다.</p>
          )}
        </div>

        <div>
          <label>공개 여부</label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </div>

        <Button type="submit">수정</Button>
      </form>
    </>
  );
};

export default EditPostClient;
