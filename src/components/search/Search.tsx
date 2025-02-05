import React from "react";
import { TextField } from "@mui/material";

interface ISearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Search: React.FC<ISearchProps> = ({ searchQuery, setSearchQuery }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value); // Update search query state
  };

  return (
    <div>
      <TextField
        label="검색어를 입력하세요"
        value={searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        fullWidth
      />
    </div>
  );
};

export default Search;
