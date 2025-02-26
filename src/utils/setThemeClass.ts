/**
 * 다크 모드일 경우 `darkClass`를 추가하여 자동으로 클래스 적용
 * @param {string} theme 현재 테마 ("dark" | "light" | undefined)
 * @param {string} darkClass 다크 모드에서 적용할 클래스
 * @param {string | string[]} [baseClasses] 기본 클래스 목록 (문자열 또는 배열, 선택적)
 * @returns 최종 클래스 문자열
 */
export function setThemeClass(
  theme: string | undefined,
  darkClass: string,
  baseClasses?: string | string[]
) {
  // ✅ baseClasses가 없으면 빈 배열로 처리
  const classes = baseClasses
    ? Array.isArray(baseClasses)
      ? baseClasses
      : [baseClasses]
    : [];

  // ✅ 다크 모드일 경우 darkClass 추가
  return [...classes, theme === "dark" ? darkClass : ""]
    .filter(Boolean)
    .join(" ");
}
