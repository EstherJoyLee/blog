"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import { rehypeFallbackLanguage } from "@/utils/rehype-fallback-language";
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
import "prismjs/themes/prism-tomorrow.css";
import { setThemeClass } from "@/utils/setThemeClass";
import { useMountedTheme } from "@/hooks/useMountedTheme";

// ✅ 언어 등록
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

interface MarkdownRendererProps {
  content: string | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { theme } = useMountedTheme();
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const isLong = content.length > 50;

  return (
    <div
      className={setThemeClass(
        theme,
        styles.darkMarkdownWrapper,
        styles.markdownWrapper
      )}
    >
      <div
        className={`${styles.contentBox} ${
          isLong && !expanded ? styles.collapsed : ""
        }`}
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

      {isLong && (
        <div className={styles.toggleBox}>
          <button
            className={styles.toggleBtn}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "접기 ▲" : "전체 보기 ▼"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
