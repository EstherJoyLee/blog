import { useRef } from "react";
import gsap from "gsap";
import { ElementType } from "react"; // ✅ 추가

export type MagneticElement = {
  tag: ElementType; // ✅ JSX에서 사용할 수 있도록 React.ElementType 지정
  text?: string;
  className?: string;
};

export const useMagneticEffect = <T extends HTMLElement>(
  elements: MagneticElement[]
) => {
  const elementRefs = useRef<(T | null)[]>([]);

  const setRef = (index: number) => (el: T | null) => {
    elementRefs.current[index] = el;
  };

  const handleMouseMove = (index: number) => (e: React.MouseEvent) => {
    const el = elementRefs.current[index];
    if (!el) return;

    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.3;
    const y = (e.clientY - (top + height / 2)) * 0.3;
    gsap.to(el, { x, y, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (index: number) => () => {
    const el = elementRefs.current[index];
    if (el) gsap.to(el, { x: 0, y: 0, duration: 0.3 });
  };

  return { setRef, handleMouseMove, handleMouseLeave, elements };
};
