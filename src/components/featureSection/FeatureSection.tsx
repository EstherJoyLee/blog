"use client";

import { useTheme } from "next-themes";
import { FaPencilAlt, FaPalette, FaSearch, FaBolt } from "react-icons/fa";
import styles from "./FeatureSection.module.scss";

const features = [
  {
    icon: <FaPencilAlt />,
    title: "빠른 블로그 작성",
    description: "쉽고 직관적인 글 작성 기능",
  },
  {
    icon: <FaPalette />,
    title: "다양한 테마 지원",
    description: "다크/라이트 모드 및 커스텀 스타일",
  },
  {
    icon: <FaSearch />,
    title: "SEO 최적화",
    description: "검색 엔진 친화적인 블로그",
  },
  { icon: <FaBolt />, title: "강력한 성능", description: "빠르고 최적화된 UX" },
];

console.log("SCSS 모듈 확인: ", styles);

export default function FeatureSection() {
  const { theme } = useTheme();

  return (
    <section
      className={`${styles.featureSection} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
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
}
