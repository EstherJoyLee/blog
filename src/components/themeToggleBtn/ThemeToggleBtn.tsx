"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import styles from "./ThemeToggleBtn.module.scss";
import { useMountedTheme } from "@/hooks/useMountedTheme";

const ThemeToggle = () => {
  const { theme, setTheme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ 마운트되기 전에는 아무것도 렌더링하지 않음 (Hydration mismatch 방지)
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`${styles.themeToggleBtn} p-2 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black transition-colors duration-300`}
    >
      {theme === "dark" ? (
        <SunIcon className="w-6 h-6" />
      ) : (
        <MoonIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
