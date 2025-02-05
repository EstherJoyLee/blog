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
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

const Aside = () => {
  useFetchFolders();
  const dispatch = useDispatch();
  const folders = useSelector(selectFolderList);
  const selectedFolderId = useSelector(selectSelectedFolder);
  const [searchQueryState, setSearchQueryState] = useState("");
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [folderPosts, setFolderPosts] = useState<Record<string, any[]>>({});

  // 현재 선택된 폴더 게시물 가져오기
  const { posts, isLoading } = useFetchPostsByFolder(selectedFolderId || "");

  useEffect(() => {
    if (searchQueryState !== "") {
      const fetchPostsForAllFolders = async () => {
        setFolderPosts((prevState) => ({
          ...prevState,
          [selectedFolderId || ""]: posts, // 폴더 ID를 키로 설정
        }));
      };

      fetchPostsForAllFolders();
    }
  }, [searchQueryState, folders, posts, selectedFolderId]);

  // 폴더 클릭 시 폴더 열기/닫기
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

  return (
    <aside>
      <Search
        searchQuery={searchQueryState}
        setSearchQuery={handleSearchChange}
      />

      <div>
        <h3>폴더 목록</h3>
        {folders.map((folder) => (
          <div key={folder.id}>
            <Button onClick={() => handleFolderClick(folder.id)}>
              {folder.name}
            </Button>
            {openFolder === folder.id && (
              <div>
                {isLoading ? (
                  <p>Loading...</p>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div key={post.id} style={{ marginBottom: "10px" }}>
                      <h4
                        style={{
                          color: searchQueryState ? "blue" : "black",
                          backgroundColor: searchQueryState
                            ? "yellow"
                            : "transparent",
                        }}
                      >
                        {post.title}
                      </h4>
                    </div>
                  ))
                ) : (
                  <p>검색된 게시물이 없습니다.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Aside;
