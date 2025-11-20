import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./Header.module.css";
import logo from "../Header/logo.png";
import { ReactComponent as CartIcon } from "../Header/cart.svg";
import { ReactComponent as ProfileIcon } from "../Header/profile.svg";
import LoginPromptModal from "../LoginPromptModal/LoginPromptModal";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      <header className={styles.header}>
        <div className={styles.topBar}>
          <img
            src={logo}
            alt="책파랑 로고"
            className={styles.logo}
            onClick={() => navigate("/")}
          />

          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>

          <div className={styles.iconBar}>
            <CartIcon
              className={styles.icon}
              onClick={() => handleProtectedClick("/cart")}
            />
            <ProfileIcon
              className={styles.icon}
              onClick={() => handleProtectedClick("/my")}
            />
          </div>
        </div>
      </header>

      {showModal && <LoginPromptModal onClose={() => setShowModal(false)} />}
    </>
  );
}
