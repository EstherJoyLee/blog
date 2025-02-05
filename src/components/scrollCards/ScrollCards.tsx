"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cardData = [
  "🔍 최신 트렌드",
  "🖋️ 간편한 글쓰기",
  "📈 성장 분석",
  "🔍 최신 트렌드",
  "🖋️ 간편한 글쓰기",
  "📈 성장 분석",
];

const ScrollCards = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, rotateY: 30 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
          },
        }
      );
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-20 py-20">
      {cardData.map((text, index) => (
        <div
          key={index}
          ref={(el) => {
            cardsRef.current[index] = el;
          }}
          className="w-80 h-52 flex justify-center items-center rounded-2xl bg-gradient-to-r from-pink-500 to-red-400 text-white text-xl font-bold opacity-0"
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default ScrollCards;
