"use client";

import { useMagneticEffect } from "@/hooks/useMagneticEffect";
import styles from "./HeroSection.module.scss";
import Image from "next/image";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";

const HeroSection = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const { setRef, handleMouseMove, handleMouseLeave, elements } =
    useMagneticEffect<HTMLElement>([
      {
        tag: "h1",
        text: "블로그를 시작해보세요!",
        className: `${styles.heading} text-5xl font-bold cursor-pointer`,
      },
      {
        tag: "p",
        text: "쉽고 강력한 블로그 서비스",
        className: `${styles.paragraph} text-lg mt-4`,
      },
      {
        tag: "button",
        text: "지금 시작하기 →",
        className: `${styles.glassButton}`,
      },
    ]);

  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ 마운트되기 전에는 아무것도 렌더링하지 않음 (Hydration mismatch 방지)
  }

  return (
    <section
      className={`flex flex-col items-center justify-center h-screen text-center transition-colors duration-300 ${setThemeClass(
        theme,
        styles.darkHeroSection,
        styles.heroSection
      )}`}
    >
      {!isMobile ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.videoBackground}
          poster="/videos/background-placeholder.jpg" // ✅ 비디오 로딩 전 표시할 정적 이미지
        >
          <source src="/videos/background-video.mp4" type="video/mp4" />
          <source src="/videos/background-video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <Image
          src="/videos/background-placeholder.jpg"
          alt="hero section background image"
          fill
          priority
        />
      )}
      <div className={styles.overlay}></div>
      <div className={styles.heroTexts}>
        {elements.map(({ tag: Tag, text, className }, index) =>
          Tag === "button" ? (
            <Tag key={index} className={className}>
              <a
                ref={setRef(index)}
                onMouseMove={handleMouseMove(index)}
                onMouseLeave={handleMouseLeave(index)}
                href="/signup"
              >
                {text}
              </a>
            </Tag>
          ) : (
            <Tag
              key={index}
              ref={setRef(index)}
              onMouseMove={handleMouseMove(index)}
              onMouseLeave={handleMouseLeave(index)}
              className={className}
            >
              {text}
            </Tag>
          )
        )}
      </div>
    </section>
  );
};

export default HeroSection;
