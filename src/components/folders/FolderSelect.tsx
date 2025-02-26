import React from "react";
import styles from "./Folders.module.scss";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";

interface Folder {
  id: string;
  name: string;
}

interface FolderSelectProps {
  selectedFolder: string;
  setSelectedFolder: (folderId: string) => void;
  folders: Folder[];
}

const FolderSelect = ({
  selectedFolder,
  setSelectedFolder,
  folders,
}: FolderSelectProps) => {
  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${setThemeClass(
        theme,
        styles.darkFolderGroup,
        styles.folderGroup
      )}`}
    >
      <label>
        폴더 선택: <b>*</b>
      </label>
      <div className={styles.folderSelectWrapper}>
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          required
          className={styles.folderSelect}
        >
          <option value="">폴더를 선택하세요</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FolderSelect;
