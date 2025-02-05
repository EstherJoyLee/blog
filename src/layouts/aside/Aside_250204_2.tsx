"use client";

import Search from "@/components/search/Search";
import useFetchFolders from "@/hooks/useFetchFolders";
import useFetchPostsByFolder from "@/hooks/useFetchPostsByFolder";
import {
  selectFolderList,
  selectSelectedFolder,
  SET_SEARCH_QUERY,
  SET_SELECTED_FOLDER,
} from "@/redux/slice/folderSlice";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Aside.module.scss";
import { ClipLoader } from "react-spinners";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import useFetchAllPosts from "@/hooks/useFetchAllPosts";

const Aside = () => {
  const dispatch = useDispatch();
  const blogUrl = useGetBlogNameFromUrl();
  const folders = useSelector(selectFolderList);
  const selectedFolderId = useSelector(selectSelectedFolder);
  const [searchQueryState, setSearchQueryState] = useState("");
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  useFetchFolders(); // 폴더 목록 가져오기 (블로그 URL 기준 필터링 필요)

  // 현재 선택된 폴더의 게시물 가져오기

  const { posts, isLoading } = useFetchPostsByFolder(selectedFolderId || "");
  const { allPosts } = useFetchAllPosts();

  // console.log("😡blogUrl: ", blogUrl);
  // console.log("😡folders: ", folders);

  // 📌 **해당 블로그의 폴더만 필터링**
  const filteredFolders = blogUrl
    ? folders.filter((folder) => folder.blogUrl === blogUrl)
    : [];

  // 폴더 클릭 시 폴더 열기/닫기 및 선택된 폴더 설정
  const handleFolderClick = (folderId: string) => {
    setOpenFolder((prevState) => (prevState === folderId ? null : folderId));
    dispatch(SET_SELECTED_FOLDER(folderId));
  };

  const handleSearchChange = (query: string) => {
    setSearchQueryState(query);
    dispatch(SET_SEARCH_QUERY(query));
  };

  // 검색어에 따른 게시물 필터링
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQueryState.toLowerCase())
  );

  const filteredQueryPosts = allPosts.filter((post) =>
    post.title!.toLowerCase().includes(searchQueryState.toLowerCase())
  );

  useEffect(() => {
    const filteredQueryPostsFolderId = filteredQueryPosts.map((folder) => {
      return folder.folderId;
    });
    console.log(
      "📌 현재 filteredQueryPosts's folderId:",
      filteredQueryPostsFolderId
    );
  }, [filteredQueryPosts]);

  return (
    <aside className={styles.aside}>
      {blogUrl ? ( // 📌 `blogUrl`이 있을 때만 목록을 표시
        <>
          {/* 검색 기능 (주석 해제 가능) */}
          <Search
            searchQuery={searchQueryState}
            setSearchQuery={handleSearchChange}
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
                  {openFolder === folder.id && (
                    <div className={styles.posts}>
                      <h1>{folder.id}</h1>
                      {isLoading ? (
                        <ClipLoader
                          color="#000000"
                          loading={isLoading}
                          size={16}
                          className={styles.loader}
                        />
                      ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                          <div key={post.id} className={styles.postTitle}>
                            <h4
                              style={{
                                color: searchQueryState ? "blue" : "black",
                                backgroundColor: searchQueryState
                                  ? "yellow"
                                  : "transparent",
                              }}
                            >
                              <a href={`/blog/${blogUrl}/post/${post.id}`}>
                                {post.title}
                              </a>
                            </h4>
                          </div>
                        ))
                      ) : (
                        <p className={styles.postErrMsg}>게시물이 없습니다.</p>
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
        </>
      ) : (
        <h1>잘못된 접근입니다.</h1>
      )}
    </aside>
  );
};

export default Aside;
