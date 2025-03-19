"use client";

import { auth, db } from "@/firebase/config";
import {
  ADD_FOLDERS,
  DELETE_FOLDERS,
  UPDATE_FOLDERS,
} from "@/redux/slice/folderSlice";
import { IFolderProps } from "@/types";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { Button, TextField } from "@mui/material";
import {
  addDoc,
  collection,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./Folders.module.scss";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";

const Folder = ({ folders }: IFolderProps) => {
  const dispatch = useDispatch();
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const blogUrl = useGetBlogNameFromUrl();
  const user = auth.currentUser;

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    if (newFolderName) {
      try {
        // const userDocRef = doc(db, "users", blogUrl);
        // const userDocSnap = await getDoc(userDocRef);

        if (!user) {
          throw new Error("사용자가 로그인하지 않았습니다.");
        }
        // Firebase에 폴더 추가
        const folderRef = await addDoc(collection(db, "folders"), {
          name: newFolderName,
          authorUid: user.uid,
          blogUrl,
        });

        // Redux 상태 업데이트
        dispatch(
          ADD_FOLDERS({
            id: folderRef.id,
            name: newFolderName,
            authorUid: user.uid,
            blogUrl,
          })
        );

        setNewFolderName(""); // 입력란 초기화
      } catch (error) {
        console.error("폴더 추가 오류:", error);
      }
    }
  };

  const handleUpdateFolder = async () => {
    if (editingFolder && editedName) {
      try {
        if (!user) {
          throw new Error("사용자가 로그인하지 않았습니다.");
        }
        // Firebase에서 폴더 수정
        const folderRef = doc(db, "folders", editingFolder);
        await updateDoc(folderRef, {
          name: editedName,
          authorUid: user.uid,
          blogUrl,
        });

        // Redux 상태 업데이트
        dispatch(
          UPDATE_FOLDERS({
            id: editingFolder,
            name: editedName,
            authorUid: user.uid,
            blogUrl: blogUrl,
          })
        );

        setEditingFolder(null);
        setEditedName(""); // 입력란 초기화
      } catch (error) {
        console.error("폴더 수정 오류:", error);
      }
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      // Firebase에서 폴더 삭제

      const batch = writeBatch(db);

      const postsCollection = collection(db, "posts");
      const postsQuery = query(postsCollection, where("folderId", "==", id));
      const postSnapshot = await getDocs(postsQuery);
      // console.log("💡하위 게시물 목록 가져오기 성공!");

      postSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      const folderRef = doc(db, "folders", id);
      await deleteDoc(folderRef);
      console.log("😡폴더 삭제 성공!!");
      // Redux 상태 업데이트 (삭제된 폴더를 Redux에서 제거)
      dispatch(DELETE_FOLDERS(id));
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
    }
  };

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${setThemeClass(
        theme,
        styles.darkFolderWrapper,
        styles.folderWrapper
      )}`}
    >
      <label>폴더 관리</label>
      <div className={styles.folderManagement}>
        <div className={styles.folderInput}>
          <TextField
            label="새 폴더 이름"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Button onClick={handleAddFolder}>폴더 추가</Button>
        </div>

        <div className={styles.folderList}>
          {folders.map((folder) => (
            <div key={folder.id} className={styles.folderItem}>
              {editingFolder === folder.id ? (
                <div>
                  <TextField
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <div className={styles.folderButtons}>
                    <Button onClick={handleUpdateFolder}>완료</Button>
                    <Button
                      onClick={() => {
                        setEditingFolder(null);
                        setEditedName("");
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <span>{folder.name}</span>
                  <div className={styles.folderButtons}>
                    <Button onClick={() => setEditingFolder(folder.id)}>
                      수정
                    </Button>
                    <Button onClick={() => handleDeleteFolder(folder.id)}>
                      삭제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Folder;
