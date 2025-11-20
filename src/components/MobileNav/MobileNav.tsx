import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./MobileNav.module.css";
import cart from "../Header/cart.svg";
import search from "../Header/search.svg";
import menu from "../CategoryNavBar/menu.svg";
import logo from "./logo.png";
import logo1 from "./logo1.png";
import mypage from "./mypage.svg";
import MobileSearch from "../MobileSearch/MobileSearch";
import LoginPromptModal from "../LoginPromptModal/LoginPromptModal";

export default function MobileNav() {
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true,
        });
        setIsLoggedIn(!!res.data);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const handleProtectedClick = (path: string) => {
    if (!isLoggedIn) {
      setShowModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <nav className={styles.mobileNav}>
        <div>
          {/* 📁 카테고리 */}
          <button className={styles.navButton}>
            <img src={menu} className={styles.menu} alt="카테고리" />
            <span>카테고리</span>
          </button>

          {/* 🔍 검색 */}
          <button
            className={styles.navButton}
            onClick={() => setShowSearch(true)}
          >
            <img src={search} className={styles.search} alt="검색" />
            <span>검색</span>
          </button>

          {/* 🏠 홈 */}
          <button
            className={`${styles.navButton} ${styles.homeButton}`}
            onMouseEnter={() => setIsHomeHovered(true)}
            onMouseLeave={() => setIsHomeHovered(false)}
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src={isHomeHovered ? logo : logo1}
              className={styles.logo}
              alt="홈"
            />
            <span>홈</span>
          </button>

          {/* 🛒 장바구니 */}
          <button
            className={styles.navButton}
            onClick={() => handleProtectedClick("/cart")}
          >
            <img src={cart} className={styles.cart} alt="장바구니" />
            <span>장바구니</span>
          </button>

          {/* 👤 마이페이지 */}
          <button
            className={styles.navButton}
            onClick={() => handleProtectedClick("/my")}
          >
            <img src={mypage} className={styles.mypage} alt="마이페이지" />
            <span>마이페이지</span>
          </button>
        </div>
      </nav>

      {/* 🔎 모바일 검색창 */}
      {showSearch && <MobileSearch onClose={() => setShowSearch(false)} />}

      {/* 💬 로그인 모달 */}
      {showModal && <LoginPromptModal onClose={() => setShowModal(false)} />}
    </>
  );
}
