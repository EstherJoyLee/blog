"use client";

import styles from "./Footer.module.scss";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
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
            href="https://github.com/EstherJoyLee"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.instagram.com/hello_world_joy"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
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
}
