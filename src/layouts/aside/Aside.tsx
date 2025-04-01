"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Aside.module.scss";
import { ClipLoader } from "react-spinners";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";
import {
  selectFolderList,
  selectSelectedFolder,
  SET_SELECTED_FOLDER,
} from "@/redux/slice/folderSlice";
import useFetchFolders from "@/hooks/useFetchFolders";
import useFetchPostsByFolder from "@/hooks/useFetchPostsByFolder";
import useFetchAllPosts from "@/hooks/useFetchAllPosts";
import { useIsOwner } from "@/components/checkIsOwner/CheckIsOwner";
import Search from "@/components/search/Search";
import CustomButton from "@/components/FormLayout/Button/Button";

const Aside = () => {
  const dispatch = useDispatch();
  const blogUrl = useGetBlogNameFromUrl();
  const folders = useSelector(selectFolderList);
  const selectedFolderId = useSelector(selectSelectedFolder);
  const { posts, isLoading } = useFetchPostsByFolder(selectedFolderId || "");
  const { allPosts } = useFetchAllPosts();
  const { isOwner } = useIsOwner();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQueryState, setSearchQueryState] = useState("");
  const [openFolders, setOpenFolders] = useState<string | null>(null);
  const [openAside, setOpenAside] = useState(false);

  useFetchFolders();

  const filteredFolders = useMemo(() => {
    return folders
      .map((folder) => ({
        id: folder.id,
        name: folder.name ?? "이름 없음",
        authorUid: folder.authorUid ?? "알 수 없음",
        blogUrl: folder.blogUrl ?? "",
      }))
      .filter((folder) => folder.blogUrl === blogUrl);
  }, [folders, blogUrl]);

  const filteredQueryPosts = useMemo(() => {
    if (!searchQueryState) return [];
    const queryPosts = allPosts.filter((post) =>
      post.title?.toLowerCase().includes(searchQueryState.toLowerCase())
    );
    return Array.from(
      new Map(queryPosts.map((post) => [post.id, post])).values()
    );
  }, [searchQueryState, allPosts]);

  useEffect(() => {
    if (filteredQueryPosts.length > 0) {
      setOpenFolders(filteredQueryPosts[0].folderId || null);
    } else {
      setOpenFolders(null);
    }
  }, [filteredQueryPosts]);

  const handleFolderClick = (folderId: string) => {
    setOpenFolders((prev) => (prev === folderId ? null : folderId));
    dispatch(SET_SELECTED_FOLDER(folderId));
  };

  const toggleAside = () => setOpenAside(!openAside);

  useEffect(() => {
    document.body.style.overflow = openAside ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openAside]);

  useEffect(() => {
    setOpenAside(false);
    setOpenFolders(null);
    setSearchQueryState("");
  }, [pathname]);

  const { theme, mounted } = useMountedTheme();
  if (!mounted || !blogUrl) return null;

  return (
    <>
      <div
        id={styles.toggleAsideBtn}
        className={`${openAside ? styles.active : ""}`}
        onClick={toggleAside}
      >
        {openAside ? <FaTimes /> : <FaSearch />}
      </div>

      <aside
        className={`${setThemeClass(theme, styles.darkAside, styles.aside)} ${
          openAside ? styles.active : ""
        }`}
      >
        <Search
          searchQuery={searchQueryState}
          setSearchQuery={setSearchQueryState}
        />

        <div className={styles.folders}>
          {filteredFolders.length > 0 ? (
            filteredFolders.map((folder) => {
              const isOpen = openFolders === folder.id;
              const targetPosts =
                searchQueryState.length > 0
                  ? filteredQueryPosts.filter(
                      (post) => post.folderId === folder.id
                    )
                  : posts.filter((post) => post.folderId === folder.id);

              return (
                <div key={folder.id} className={styles.folder}>
                  <button
                    className={styles.folderBtn}
                    onClick={() => handleFolderClick(folder.id)}
                    aria-label="하위 게시물 열기 버튼"
                  >
                    {folder.name}
                  </button>

                  {isOpen && (
                    <div className={styles.posts}>
                      {isLoading ? (
                        <ClipLoader color="#000000" loading size={16} />
                      ) : targetPosts.length > 0 ? (
                        targetPosts.map((post) => (
                          <div key={post.id} className={styles.postTitle}>
                            <h4>
                              <a href={`/blog/${blogUrl}/post/${post.id}`}>
                                {post.title}
                              </a>
                            </h4>
                          </div>
                        ))
                      ) : (
                        <p className={styles.noPostsMsg}>
                          해당 폴더에 게시물이 없습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className={styles.postErrMsg}>해당 블로그에 폴더가 없습니다.</p>
          )}
        </div>

        {isOwner && (
          <CustomButton
            text="포스트 생성"
            variant="contained"
            aria-label="포스트 생성 버튼"
            color="primary"
            onClick={() => router.push(`/blog/${blogUrl}/create`)}
          />
        )}
      </aside>
    </>
  );
};

export default Aside;
