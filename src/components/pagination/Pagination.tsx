"use client";

import React, { useEffect } from "react";

interface PaginationProps {
  totalItems: number; // 총 게시물 수
  itemsPerPage: number; // 페이지당 표시할 게시물 수
  currentPage: number; // 현재 페이지 번호
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    // Ensure currentPage is within the valid range when itemsPerPage changes
    if (currentPage > totalPages) {
      onPageChange(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage, onPageChange]);

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "20px",
      }}
    >
      <button onClick={handleFirstPage} disabled={currentPage === 1}>
        처음으로
      </button>
      <button onClick={handlePrevPage} disabled={currentPage === 1}>
        이전
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            fontWeight: currentPage === page ? "bold" : "normal",
            textDecoration: currentPage === page ? "underline" : "none",
          }}
        >
          {page}
        </button>
      ))}

      <button onClick={handleNextPage} disabled={currentPage === totalPages}>
        다음
      </button>
      <button onClick={handleLastPage} disabled={currentPage === totalPages}>
        마지막으로
      </button>
    </div>
  );
};

export default Pagination;
