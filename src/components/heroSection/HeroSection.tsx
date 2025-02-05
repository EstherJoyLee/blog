"use client";

import { useTheme } from "next-themes";
import { useMagneticEffect } from "@/hooks/useMagneticEffect";
import styles from "./HeroSection.module.scss";

export default function HeroSection() {
  const { theme } = useTheme();
  const { setRef, handleMouseMove, handleMouseLeave, elements } =
    useMagneticEffect<HTMLElement>([
      {
        tag: "h1",
        text: "블로그를 시작해보세요!",
        className: "text-5xl font-bold cursor-pointer",
      },
      {
        tag: "p",
        text: "쉽고 강력한 블로그 서비스",
        className: "text-lg mt-4",
      },
      {
        tag: "button",
        text: "지금 시작하기 →",
        className: `${styles.glassButton}`,
      },
    ]);

  return (
    <section
      className={`flex flex-col items-center justify-center h-screen text-center transition-colors duration-300 ${
        theme === "dark" ? styles.darkBackground : styles.lightBackground
      }`}
    >
      {elements.map(({ tag: Tag, text, className }, index) => (
        <Tag
          key={index}
          ref={setRef(index)}
          onMouseMove={handleMouseMove(index)}
          onMouseLeave={handleMouseLeave(index)}
          className={className}
        >
          {text}
        </Tag>
      ))}
    </section>
  );
}
