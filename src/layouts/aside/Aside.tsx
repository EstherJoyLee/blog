"use client";

import Search from "@/components/search/Search";
import useFetchFolders from "@/hooks/useFetchFolders";
import useFetchPostsByFolder from "@/hooks/useFetchPostsByFolder";
import {
  selectFolderList,
  selectSelectedFolder,
  SET_SELECTED_FOLDER,
} from "@/redux/slice/folderSlice";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Aside.module.scss";
import { ClipLoader } from "react-spinners";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import useFetchAllPosts from "@/hooks/useFetchAllPosts";
import { IPostState } from "@/types";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import CustomButton from "@/components/FormLayout/Button/Button";
import { usePathname, useRouter } from "next/navigation";
import { useIsOwner } from "@/components/checkIsOwner/CheckIsOwner";
import { FaSearch, FaTimes } from "react-icons/fa";
const Aside = () => {
  const dispatch = useDispatch();
  const blogUrl = useGetBlogNameFromUrl();
  const folders = useSelector(selectFolderList);
  const [filteredFolders, setFilteredFolders] = useState<
    { id: string; name?: string; authorUid?: string; blogUrl?: string }[]
  >([]);

  const selectedFolderId = useSelector(selectSelectedFolder);
  const [searchQueryState, setSearchQueryState] = useState("");
  const [openFolders, setOpenFolders] = useState<string | null>(null); // ✅ 하나의 폴더만 열도록 변경
  const [filteredQueryPosts, setFilteredQueryPosts] = useState<IPostState[]>(
    []
  );
  const [openAside, setOpenAside] = useState(false);
  const pathname = usePathname();

  const router = useRouter();
  const { isOwner } = useIsOwner();
  useFetchFolders(); // 🔥 폴더 목록 가져오기

  // ✅ 현재 선택된 폴더의 게시물 가져오기
  const { posts, isLoading } = useFetchPostsByFolder(selectedFolderId || "");
  const { allPosts } = useFetchAllPosts();

  // 📌 **해당 블로그의 폴더만 필터링**
  useEffect(() => {
    setFilteredFolders(
      folders
        .map((folder) => ({
          id: folder.id,
          name: folder.name ?? "이름 없음",
          authorUid: folder.authorUid ?? "알 수 없음",
          blogUrl: folder.blogUrl ?? "",
        }))
        .filter((folder) => folder.blogUrl === blogUrl)
    );
  }, [folders, blogUrl]);

  // 📌 **검색 기능 (중복 제거)**
  useEffect(() => {
    if (searchQueryState) {
      const queryPosts = allPosts.filter((post) =>
        post.title?.toLowerCase().includes(searchQueryState.toLowerCase())
      );

      // ✅ 🔥 중복 제거
      const uniquePosts = Array.from(
        new Map(queryPosts.map((post) => [post.id, post])).values()
      );
      setFilteredQueryPosts(uniquePosts);

      if (uniquePosts.length > 0) {
        setOpenFolders(uniquePosts[0].folderId || null); // 🔹 첫 번째 검색된 폴더 열기
      }
    } else {
      setFilteredQueryPosts([]);
      setOpenFolders(null);
    }
  }, [searchQueryState, allPosts]);

  // 📌 **폴더 클릭 시 해당 폴더만 열기, 다른 폴더는 닫기**
  const handleFolderClick = (folderId: string) => {
    setOpenFolders((prev) => (prev === folderId ? null : folderId));
    dispatch(SET_SELECTED_FOLDER(folderId));
  };

  const toggleAside = () => {
    setOpenAside(!openAside);
  };

  useEffect(() => {
    document.body.style.overflow = openAside ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto"; // 컴포넌트 언마운트 시 초기화
    };
  }, [openAside]);

  useEffect(() => {
    // 페이지 변경될 때 상태 초기화
    setOpenAside(false);
    setOpenFolders(null);
    setSearchQueryState("");
    // console.log("pathname: ", pathname);
  }, [pathname]);

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ Hydration mismatch 방지
  }

  return (
    <>
      {!blogUrl ? (
        ""
      ) : (
        <>
          <div
            id={styles.toggleAsideBtn}
            className={`${openAside ? styles.active : ""}`}
            onClick={toggleAside}
          >
            {openAside ? <FaTimes /> : <FaSearch />}
          </div>
          <aside
            className={`${setThemeClass(
              theme,
              styles.darkAside,
              styles.aside
            )} ${openAside ? styles.active : ""}`}
          >
            {blogUrl ? (
              <>
                {/* 🔍 검색 기능 */}
                <Search
                  searchQuery={searchQueryState}
                  setSearchQuery={setSearchQueryState}
                />

                <div className={styles.folders}>
                  {filteredFolders.length > 0 ? (
                    filteredFolders.map((folder) => (
                      <div key={folder.id} className={styles.folder}>
                        <button
                          className={styles.folderBtn}
                          onClick={() => handleFolderClick(folder.id)}
                        >
                          {folder.name}
                        </button>

                        {openFolders === folder.id && (
                          <div className={styles.posts}>
                            {isLoading ? (
                              <ClipLoader
                                color="#000000"
                                loading={isLoading}
                                size={16}
                              />
                            ) : (
                              (() => {
                                const filteredPosts =
                                  searchQueryState.length > 0
                                    ? filteredQueryPosts.filter(
                                        (post) => post.folderId === folder.id
                                      )
                                    : posts.filter(
                                        (post) => post.folderId === folder.id
                                      );

                                return filteredPosts.length > 0 ? (
                                  filteredPosts.map((post) => (
                                    <div
                                      key={post.id}
                                      className={styles.postTitle}
                                    >
                                      <h4>
                                        <a
                                          href={`/blog/${blogUrl}/post/${post.id}`}
                                        >
                                          {post.title}
                                        </a>
                                      </h4>
                                    </div>
                                  ))
                                ) : (
                                  <p className={styles.noPostsMsg}>
                                    해당 폴더에 게시물이 없습니다.
                                  </p>
                                );
                              })()
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={styles.postErrMsg}>
                      해당 블로그에 폴더가 없습니다.
                    </p>
                  )}
                </div>

                {isOwner && (
                  <CustomButton
                    text="포스트 생성"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      router.push(`/blog/${blogUrl}/create`);
                    }}
                  />
                )}
              </>
            ) : (
              <h1>잘못된 접근입니다.</h1>
            )}
          </aside>
        </>
      )}
    </>
  );
};

export default Aside;
