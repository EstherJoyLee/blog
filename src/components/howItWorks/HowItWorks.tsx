"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HowItWorks.module.scss";
import { FaUser, FaPenFancy, FaRocket, FaShare } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: <FaUser />,
    title: "회원가입",
    description: "이메일 또는 소셜 로그인으로 계정 생성",
  },
  {
    icon: <FaPenFancy />,
    title: "블로그 생성",
    description: "블로그 제목과 디자인 설정",
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

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "restart pause resume pause",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className={styles.howItWorks}>
      <h2 className={styles.title}>블로그 사용 방법</h2>
      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.icon}>{step.icon}</div>
            <div className={styles.content}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
