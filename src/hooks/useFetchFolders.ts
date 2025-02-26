"use client";

import { db } from "@/firebase/config";
import { SET_FOLDERS } from "@/redux/slice/folderSlice";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useFetchFolders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const blogUrl = useGetBlogNameFromUrl();

  useEffect(() => {
    if (!blogUrl) return;
    const fetchFolders = async () => {
      try {
        setIsLoading(true);

        const q = query(
          collection(db, "folders"),
          where("blogUrl", "==", blogUrl)
        );

        const foldersSnapshot = await getDocs(q);
        console.log("🐰blogUrl:", blogUrl);
        const foldersData = foldersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          authorUid: doc.data().authorUid,
          blogUrl: doc.data().blogUrl,
        }));
        dispatch(SET_FOLDERS(foldersData));
        console.log("foldersData: ", foldersData);
      } catch (error) {
        console.error("폴더를 가져오는 중 오류 발생: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFolders();
  }, [blogUrl]);

  return { isLoading };
};

export default useFetchFolders;
