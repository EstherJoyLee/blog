import { notFound } from "next/navigation";
import React from "react";

const ErrrorClient = async () => {
  const displayName = null; // 조건에 맞지 않으면 404 페이지로 이동

  if (!displayName) {
    notFound(); // 존재하지 않는 경로로 리디렉션
  }
  return (
    <div>
      <h1>404 - 페이지를 찾을 수 없습니다.</h1>
      <p>요청하신 페이지가 존재하지 않습니다.</p>
    </div>
  );
};

export default ErrrorClient;
