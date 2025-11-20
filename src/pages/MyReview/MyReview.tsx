import { useState } from "react";
import EditProfile from "../../components/EditProfile/EditProfile";
import MyPageSidebar from "../../components/MyPageSidebar/MyPageSidebar";
import ReviewArea from "../../components/MyReviewContent/MyReviewArea/ReviewArea";
import styles from "./MyReview.module.css";
import arrow from "./왼쪽_화살표.svg";
import Wishlist from "../../components/Wishlist/Wishlist";
import ReadingCalendar from "../../components/ReadingCalendar/ReadingCalendar";

export default function MyReview() {
  const [activeTab, setActiveTab] = useState("구매도서");

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>
          <button className={styles.backButton} onClick={handleGoBack}>
            <img src={arrow} alt="뒤로가기" />
          </button>
          마이페이지
        </h1>
      </div>

      <div className={styles.contWrap}>
        <MyPageSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={styles.contentArea}>
          {activeTab === "회원정보" && <EditProfile />}
          {activeTab === "구매도서" && <ReviewArea />}
          {activeTab === "관심도서" && <Wishlist />}
          {activeTab === "독서기록" && <ReadingCalendar />}
        </div>
      </div>
    </div>
  );
}
