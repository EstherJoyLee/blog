"use client";

import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import React, { useRef, useState } from "react";
import uploadImage from "@/utils/uploadImage";
import { useDispatch, useSelector } from "react-redux";
import { setPublicUrl } from "@/redux/slice/imageSlice";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { selectFolderList } from "@/redux/slice/folderSlice";
import Folder from "@/components/folders/Folder";
import useFetchFolders from "@/hooks/useFetchFolders";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";

const CreatePostClient = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const blogUrl = useGetBlogNameFromUrl();
  const editorRef = useRef<HTMLDivElement>(null);
  const draggedImageRef = useRef<HTMLImageElement | null>(null);
  const draggedImageSrc = useRef<string | null>(null);

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

  const handleFileChange = (file: File) => {
    // console.log("handleFileChange Test");
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        insertImageAtCursor(reader.result as string);
        // console.log(
        //   `💻reader: ${JSON.stringify(reader)}\n 🤢reader.result: ${
        //     reader.result
        //   }`
        // );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // 한글 조합이 끝난 후만 setContent 실행
  const handleInput = () => {
    if (!isComposing && editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (e.key === "Backspace") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // const range = selection.getRangeAt(0);

      if (editor.innerText.trim() === "") {
        e.preventDefault();
        editor.innerHTML = "<br/>";
        return;
      }

      // if (range.startContainer.nodeType === 3) {
      //   e.preventDefault(); // 기본 동작 방지

      //   if (selection.anchorNode && selection.anchorNode.parentElement) {
      //     selection.anchorNode.parentElement.remove();
      //   }
      // }
    }
  };

  const handleBlur = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (editor.innerText.trim() === "") {
      editor.innerHTML = "<br/>";
    }
  };

  // 🖼️ 이미지 삽입 함수
  const insertImageAtCursor = (imageSrc: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.maxWidth = "300px";
    img.style.cursor = "grab";
    img.draggable = true; // 드래그 가능하게 설정
    img.contentEditable = "false";

    // 드래그 이벤트 추가
    img.addEventListener("dragstart", (e: DragEvent) =>
      handleDragStart(e, img)
    );

    range.insertNode(img);
    range.setStartAfter(img);
    range.setEndAfter(img);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // 🎯 드래그 시작
  const handleDragStart = (e: DragEvent, img: HTMLImageElement) => {
    draggedImageSrc.current = img.src;
    e.dataTransfer?.setData("text/plain", img.src);
  };
  // 🏁 드롭 이벤트 (이미지 이동)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;

    const imageSrc = e.dataTransfer.getData("text/plain");
    if (!imageSrc) return;

    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // 기존 이미지 삭제
    if (draggedImageSrc.current) {
      const existingImg = editor.querySelector(
        `img[src="${draggedImageSrc.current}"]`
      );
      if (existingImg) existingImg.remove();
    }

    // 새로운 위치에 이미지 삽입
    const range = selection.getRangeAt(0);
    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.maxWidth = "300px";
    img.style.cursor = "grab";
    img.draggable = true;
    img.contentEditable = "false";

    img.addEventListener("dragstart", (e) => handleDragStart(e, img));

    range.insertNode(img);
    draggedImageSrc.current = null;
  };

  // 🚫 기본 드래그 동작 방지
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  return (
    <div>
      <h1>게시물 작성</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown} // 백스페이스 문제 해결
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onDragOver={handleDragOver} // 드래그 방지
          onDrop={handleDrop} // 이미지 이동 활성화
          onBlur={handleBlur}
        ></div>
        <div>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                setImage(file); // 상태 업데이트
                handleFileChange(file);
              }
            }}
          />
        </div>
        <div>
          <label>공개 여부:</label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </div>
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
    </div>
  );
};

export default CreatePostClient;
