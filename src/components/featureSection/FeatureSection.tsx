"use client";

import {
  FaPencilAlt,
  FaPalette,
  FaSearch,
  FaBolt,
  FaTag,
} from "react-icons/fa";
import styles from "./FeatureSection.module.scss";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";

const features = [
  {
    icon: <FaPencilAlt />,
    title: "빠른 블로그 작성",
    description: "쉽고 직관적인 글 작성 기능",
  },
  {
    icon: <FaPalette />,
    title: "다크/라이트 모드 지원",
    description: "다크/라이트 모드 지원으로 시력 보호호",
  },
  {
    icon: <FaSearch />,
    title: "SEO 최적화",
    description: "검색 엔진 친화적인 블로그",
  },
  { icon: <FaBolt />, title: "강력한 성능", description: "빠르고 최적화된 UX" },
  {
    icon: <FaTag />,
    title: "Markdown 지원",
    description: "Markdown 문법을 사용한 쉽고 빠른 텍스트 포맷팅",
  },
];

const FeatureSection = () => {
  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ 마운트되기 전에는 아무것도 렌더링하지 않음 (Hydration mismatch 방지)
  }

  return (
    <section
      className={`${setThemeClass(
        theme,
        styles.darkFeatureSection,
        styles.featureSection
      )}`}
    >
      <h2 className={styles.title}>블로그 서비스 주요 기능</h2>
      <div className={styles.featuresContainer}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <span className={styles.icon}>{feature.icon}</span>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
