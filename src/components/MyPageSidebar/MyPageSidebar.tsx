import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MyPageSidebar.module.css";
import profile from "../MemberReviews/profile.png";

interface MyPageSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface UserProfile {
  nickname: string;
  profileImage: string;
}

export default function MyPageSidebar({ activeTab, setActiveTab }: MyPageSidebarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 로그인된 유저 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true, // 쿠키 포함
        });
        setUser(res.data);
      } catch (err) {
        console.error("❌ 유저 정보를 불러오지 못했습니다:", err);
      }
    };
    fetchUser();
  }, []);

  const tabs = ["관심도서", "독서기록", "구매도서"];

  return (
    <div className={styles.sidebar}>
      {/* 내 정보 섹션 */}
      <div className={styles.userInfo}>
        <div className={styles.profileImage}>
          <img
            src={user?.profileImage || profile} // ✅ 서버 이미지 or 기본 이미지
            alt="프로필 이미지"
          />
        </div>
        <div className={styles.profileDetails}>
          <span>안녕하세요!</span>
          <h3 className={styles.nickname}>
            {user?.nickname ? user.nickname : "로딩중"}
            <span> 님</span>
          </h3>

          {/* ✅ 회원정보 버튼 클릭 시 탭 이동 */}
          <button
            className={styles.viewInfoButton}
            onClick={() => setActiveTab("회원정보")}
          >
            회원정보
          </button>
        </div>
      </div>

      {/* 탭 메뉴 섹션 */}
      <nav className={styles.tabMenu}>
        <ul className={styles.tabList}>
          {tabs.map((tab) => (
            <li key={tab} className={styles.tabItem}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === tab ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
