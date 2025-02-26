"use client";

import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import uploadImage from "@/utils/uploadImage";
import { useDispatch, useSelector } from "react-redux";
import { setPublicUrl } from "@/redux/slice/imageSlice";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { selectFolderList } from "@/redux/slice/folderSlice";
import Folder from "@/components/folders/Folder";
import useFetchFolders from "@/hooks/useFetchFolders";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import FormLayout from "@/components/FormLayout/FormLayout";
import Input from "@/components/FormLayout/Input/Input";
import FolderSelect from "@/components/folders/FolderSelect";
import { IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import styles from "./CreatePost.module.scss";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import CloseIcon from "@mui/icons-material/Close";

const CreatePostClient = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [folderModalOpen, setFolderModalOpen] = useState(false);
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
        console.log("uploadedUrl: ", uploadedUrl);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          dispatch(setPublicUrl(imageUrl));
        }
      }

      // Firestore에 게시물 저장
      console.log("📝 Firestore에 저장할 데이터:", {
        title,
        content,
        imageUrl,
        isPublic,
        folderId: selectedFolder,
        createdAt: new Date(),
        authorUid: user?.uid, // ✅ user가 null인지 체크
      });
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

  useEffect(() => {
    if (folders.length > 0) {
      setSelectedFolder(folders[folders.length - 1].id);
    }
  }, [folders]);

  const { theme } = useMountedTheme();

  return (
    <FormLayout title="게시물 작성" isPost>
      <form
        onSubmit={handleSubmit}
        className={setThemeClass(
          theme,
          styles.darkCreatePostForm,
          styles.createPostForm
        )}
      >
        <Input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          isRequired
          label="제목"
        />

        <Input
          type="text"
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          isRequired
          label="내용"
        />
        <Input
          type="file"
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            setImage(file);
          }}
          label="이미지"
        />

        <Input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic((e.target as HTMLInputElement).checked)}
          label="공개 여부"
        />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FolderSelect
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            folders={folders}
          />
          <IconButton
            className={styles.settingButton}
            onClick={() => setFolderModalOpen(true)}
          >
            <SettingsIcon />
          </IconButton>

          {/* 폴더 관리 모달 */}
          <Dialog
            open={folderModalOpen}
            onClose={() => setFolderModalOpen(false)}
            fullWidth
          >
            <DialogTitle
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              폴더 관리
              <IconButton onClick={() => setFolderModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Folder folders={folders} />
            </DialogContent>
          </Dialog>
        </div>
        <Button type="submit" variant="contained">
          작성
        </Button>
      </form>
    </FormLayout>
  );
};

export default CreatePostClient;
