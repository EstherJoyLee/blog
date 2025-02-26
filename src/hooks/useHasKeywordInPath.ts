import { usePathname } from "next/navigation";

const useHasKeywordInPath = (keywords: string | string[]) => {
  const pathname = usePathname();

  // 입력이 단일 문자열이라면 배열로 변환
  const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

  // 경로를 `/` 기준으로 나눈 배열을 사용하여 검색
  const pathSegments = pathname.split("/");

  // 일부 문자열이 포함되는 게 아니라 특정 경로 조각과 정확히 일치하는지 확인
  return keywordArray.some((keyword) => pathSegments.includes(keyword));
};

export default useHasKeywordInPath;
