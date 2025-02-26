import React from "react";
import { TextField } from "@mui/material";
import styles from "./Search.module.scss";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";

interface ISearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Search: React.FC<ISearchProps> = ({ searchQuery, setSearchQuery }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value); // Update search query state
  };

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <TextField
        label="검색어를 입력하세요"
        value={searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        fullWidth
        className={`${setThemeClass(theme, styles.darkSearch, styles.search)}`}
      />
    </div>
  );
};

export default Search;
