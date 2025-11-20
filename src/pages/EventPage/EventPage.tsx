import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EventPage.module.css";
import img1 from "./이벤트페이지_배너1.png";
import img2 from "./이벤트페이지_배너2.png";
import img3 from "./이벤트페이지_배너3.png";
import noEvent from "./Group 67.png";

function EventPage() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "ended">("ongoing");
  const [currentPage, setCurrentPage] = useState(1);

  const ongoingEvents = [
    "책파랑 그랜드오픈!",
    "블루 피리어드 1~2권 구매하고 바로 읽자!",
    "준비된 사람이 기회를 만든다",
    "블랙프라이데이 할인 대축제",
    "친구 초대하면 포인트 두 배!",
    "가을 한정 특별 메뉴 출시 기념 이벤트",
    "앱 다운로드 시 무료 음료 쿠폰 증정",
    "주말 한정 1+1 프로모션",
    "11월 생일 고객 전용 혜택",
    "리뉴얼 기념 감사 이벤트",
  ];

  const endedEvents = [
    "여름 한정 아이스 음료 할인전",
    "추석맞이 선물세트 증정 이벤트",
    "리뷰 이벤트 시즌 1",
    "5월 가정의 달 프로모션",
    "봄 신메뉴 출시 기념 쿠폰 이벤트",
    "설날 복주머니 쿠폰 증정",
    "신년맞이 럭키드로우 이벤트",
    "여름밤 야외 시네마 초대 이벤트",
  ];

  const ongoingEventsData = ongoingEvents.map((title, i) => ({
    id: i + 1,
    title,
    date: `D-${10 - (i % 10)}`,
  }));

  const endedEventsData = endedEvents.map((title, i) => ({
    id: i + 101,
    title,
    date: "종료",
  }));

  const events = activeTab === "ongoing" ? ongoingEventsData : endedEventsData;

  const eventsPerPage = 9;
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const startIndex = (currentPage - 1) * eventsPerPage;
  const eventsToShow = events.slice(startIndex, startIndex + eventsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className={styles.eventPage}>
      <div className={styles.eventContainer}>
        {/* ---------- 상단 헤더 ---------- */}
        <div className={styles.eventHeader}>
          <p className={styles.eventSubtitle}>
            {activeTab === "ongoing"
              ? "진행중인 이벤트를 확인해보세요!"
              : "종료된 이벤트 목록"}
          </p>
          <h1 className={styles.eventTitle}>이벤트</h1>
          <div className={styles.fullLine}></div>

          <div className={styles.eventTabsArea}>
            <div className={styles.eventTabsText}>
              <span
                className={`${styles.tab} ${activeTab === "ongoing" ? styles.active : ""
                  }`}
                onClick={() => {
                  setActiveTab("ongoing");
                  setCurrentPage(1);
                }}
              >
                진행중인 이벤트
              </span>
              <span
                className={`${styles.tab} ${activeTab === "ended" ? styles.active : ""
                  }`}
                onClick={() => {
                  setActiveTab("ended");
                  setCurrentPage(1);
                }}
              >
                종료된 이벤트
              </span>
            </div>
          </div>
        </div>

        {/* ---------- 카드 영역 ---------- */}
        <div className={styles.eventGrid}>
          {eventsToShow.map((event) => {
            const eventImage =
              event.id === 1 ? img1 :
                event.id === 2 ? img2 :
                  event.id === 3 ? img3 :
                    noEvent;

            const isClickable = event.id === 1 || event.id === 2 || event.id === 3;

            const cardContent = (
              <>
                <div className={styles.eventCard}>
                  <img src={eventImage} alt={event.title} className={styles.eventImage} />
                </div>
                <div className={styles.eventText}>
                  <div className={styles.eventName}>{event.title}</div>
                  <div className={styles.eventDate}>{event.date}</div>
                </div>
              </>
            );

            return isClickable ? (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className={`${styles.eventItem} ${styles.clickable}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {cardContent}
              </Link>
            ) : (
              <div key={event.id} className={`${styles.eventItem} ${styles.disabled}`}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* ---------- 페이지네이션 ---------- */}
        <div className={styles.eventPagination}>
          <span className={styles.pageArrow} onClick={handlePrev}>
            &lt;
          </span>
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <span
                key={page}
                className={
                  page === currentPage ? styles.pageActive : styles.pageNumber
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </span>
            );
          })}
          <span className={styles.pageArrow} onClick={handleNext}>
            &gt;
          </span>
        </div>
      </div>
    </div>
  );
}

export default EventPage;