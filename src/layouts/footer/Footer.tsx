"use client";

import { useMountedTheme } from "@/hooks/useMountedTheme";
import styles from "./Footer.module.scss";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { setThemeClass } from "@/utils/setThemeClass";

const Footer = () => {
  const { theme, mounted } = useMountedTheme();

  if (!mounted) {
    return null; // ✅ 마운트되기 전에는 아무것도 렌더링하지 않음 (Hydration mismatch 방지)
  }

  return (
    <footer
      className={`${setThemeClass(theme, styles.darkFooter, styles.footer)}`}
    >
      <div className={styles.content}>
        <h2 className={styles.logo}>블로그</h2>
        <nav className={styles.nav}>
          <a href="#">FAQ</a>
          <a href="#">블로그</a>
          <a href="#">이용약관</a>
          <a href="#">개인정보 처리방침</a>
        </nav>
        <div className={styles.socials}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2024 All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
