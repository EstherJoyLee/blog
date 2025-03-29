"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import { rehypeFallbackLanguage } from "@/utils/rehype-fallback-language";

// ✅ Refractor에서 언어 등록
import { refractor } from "refractor/lib/core";
import ts from "refractor/lang/typescript";
import js from "refractor/lang/javascript";
import json from "refractor/lang/json";
import bash from "refractor/lang/bash";
import jsx from "refractor/lang/jsx";
import tsx from "refractor/lang/tsx";
import markdown from "refractor/lang/markdown";
import css from "refractor/lang/css";
import markup from "refractor/lang/markup";
import shell from "refractor/lang/shell-session";
import perl from "refractor/lang/perl";
import styles from "./MarkdownRenderer.module.scss";

// ✅ 필요한 언어 등록
refractor.register(ts);
refractor.register(js);
refractor.register(json);
refractor.register(bash);
refractor.register(jsx);
refractor.register(tsx);
refractor.register(markdown);
refractor.register(css);
refractor.register(markup);
refractor.register(shell);
refractor.register(perl);

// ✅ 테마 CSS
import "prismjs/themes/prism-tomorrow.css";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";

interface MarkdownRendererProps {
  content: string | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { theme } = useMountedTheme();
  return (
    <div
      className={setThemeClass(
        theme,
        styles.darkMarkdownWrapper,
        styles.markdownWrapper
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeFallbackLanguage,
          [rehypePrism, { refractor }],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
