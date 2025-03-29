"use client";

import styles from "./HowItWorks.module.scss";
import { FaUser, FaPenFancy, FaRocket, FaShare } from "react-icons/fa";
import { useMountedTheme } from "@/hooks/useMountedTheme";
import { setThemeClass } from "@/utils/setThemeClass";

const steps = [
  {
    icon: <FaUser />,
    title: "회원가입",
    description: "이메일 또는 소셜 로그인으로 계정 생성",
  },
  {
    icon: <FaPenFancy />,
    title: "블로그 생성",
    description: "블로그 제목과 커스텀 url 설정 후 생성",
  },
  {
    icon: <FaRocket />,
    title: "글 작성",
    description: "직관적인 에디터에서 글 작성 및 저장",
  },
  {
    icon: <FaShare />,
    title: "게시 및 공유",
    description: "작성한 글을 게시하고 공유",
  },
];

const HowItWorks = () => {
  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ 마운트되기 전에는 아무것도 렌더링하지 않음 (Hydration mismatch 방지)
  }

  return (
    <section
      className={`${setThemeClass(theme, styles.darkHowItWorks, [
        styles.howItWorks,
      ])}`}
    >
      <h2 className={`${styles.title} "text-3xl font-bold mb-10 text-center"`}>
        블로그 사용 방법
      </h2>
      <div className={`${styles.timeline} "grid gap-6 w-full max-w-3xl"`}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`${styles.step} "flex items-center gap-4 p-6 rounded-xl shadow-lg bg-white hover:scale-105 transition-transform duration-300"`}
          >
            <div
              className={`${styles.icon} "text-3xl bg-gray-200 rounded-full p-3"`}
            >
              {step.icon}
            </div>
            <div className={styles.content}>
              <h3 className={`${styles.stepTitle} "text-xl font-semibold"`}>
                {step.title}
              </h3>
              <p className={`${styles.stepDescription} "text-gray-600"`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
