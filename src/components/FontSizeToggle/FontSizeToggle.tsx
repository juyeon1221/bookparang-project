import React, { useState, useEffect } from "react";
import styles from "./FontSizeToggle.module.css";

export default function FontSizeToggle() {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("largeFont") === "true";
    setIsLarge(saved);
    document.documentElement.style.fontSize = saved ? "150%" : "100%";
    document.documentElement.setAttribute("data-font", saved ? "large" : "normal");
  }, []);

  const toggleFont = () => {
    const next = !isLarge;
    setIsLarge(next);
    document.documentElement.style.fontSize = next ? "150%" : "100%";
    document.documentElement.setAttribute("data-font", next ? "large" : "normal");
    localStorage.setItem("largeFont", String(next));
  };

  return (
    <button
      className={`${styles.fontToggleBtn} ${
        isLarge ? styles.active : ""
      }`}
      onClick={toggleFont}
      title="글자 크기 전환"
    >
      <div className={styles.fontIcons}>
        <span className={styles.smallA}>A</span>
        <span className={styles.largeA}>A</span>
      </div>
      <p className={styles.fontText}>
        {isLarge ? "본글씨" : "큰글씨"}
      </p>
    </button>
  );
}
