"use client";

import { db } from "@/firebase/config";
import { SET_FOLDERS } from "@/redux/slice/folderSlice";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useFetchFolders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const foldersSnapshot = await getDocs(collection(db, "folders"));
        const foldersData = foldersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          authorUid: doc.data().authorUid,
          blogUrl: doc.data().blogUrl,
        }));
        dispatch(SET_FOLDERS(foldersData));
      } catch (error) {
        console.error("폴더를 가져오는 중 오류 발생: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFolders();
  }, []);

  return { isLoading };
};

export default useFetchFolders;
