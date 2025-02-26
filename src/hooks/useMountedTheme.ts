import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useMountedTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return { theme, setTheme, mounted };
}
