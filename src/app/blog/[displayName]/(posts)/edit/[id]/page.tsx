import React from "react";
import EditPostClient from "./EditPostClient";

const EditPost = async ({ params }: { params: { id: string } }) => {
  // 비동기로 params.id 가져오기
  const { id } = await params;

  // 방어 코드 추가: id가 없을 경우 에러 처리
  if (!id || typeof id !== "string") {
    return <h1>잘못된 접근입니다.</h1>;
  }

  return <EditPostClient postId={id} />;
};

export default EditPost;
