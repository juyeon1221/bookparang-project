import React, { useEffect, useState } from "react";
import styles from "./ReadingCalendar.module.css";

import Modal from "./Modal";
import ModalRecordView from "./ModalRecordView";
import ModalSelectView from "./ModalSelectView";

import {
  createReadingRecord,
  getAllReadingRecords,
  deleteReadingRecord,
} from "./readingRecordAPI";

export interface ReadingRecord {
  _id: string;
  date: string; // YYYY-MM-DD
  bookIsbn: string;
  book: {
    isbn: string;
    title: string;
    author: string;
    image: string;
  };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const ReadingCalendar = () => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(10);

  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"record" | "select" | null>(null);

  // 전체 로드
  const loadRecords = async () => {
    const res = await getAllReadingRecords();
    setRecords(res.data);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // 날짜 클릭 → 기록 조회 모달
  const handleDateClick = (day: Date) => {
    const dateKey = day.toISOString().split("T")[0];
    setSelectedDate(dateKey);
    setModalMode("record");
  };

  // 책 선택 → 생성 → 다시 기록 모달
  const handleSelect = async (purchase) => {
    if (!selectedDate) return;

    await createReadingRecord(selectedDate, purchase.bookIsbn);
    await loadRecords();
    setModalMode("record");
  };

  // 삭제
  const handleDelete = async (id) => {
    await deleteReadingRecord(id);
    await loadRecords();
  };

  // 달력 계산
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push(new Date(currentYear, currentMonth, d));

  while (days.length < 42) days.push(null);

  return (
    <div className={styles.calendarWrapper}>
      <h3 className={styles.title}>독서기록</h3>

      {/* 달 이동 */}
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentYear((y) => y - 1);
              setCurrentMonth(11);
            } else setCurrentMonth((m) => m - 1);
          }}
        >
          {"<"}
        </button>

        <span>{currentMonth + 1}월</span>

        <button
          className={styles.navButton}
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentYear((y) => y + 1);
              setCurrentMonth(0);
            } else setCurrentMonth((m) => m + 1);
          }}
        >
          {">"}
        </button>
      </div>

      {/* 요일 */}
      <div className={styles.weekdaysGrid}>
        {WEEKDAYS.map((w) => (
          <div key={w} className={styles.dayLabel}>
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className={styles.datesGrid}>
        {days.map((day, idx) => {
          if (!day)
            return <div key={idx} className={`${styles.dateCell} ${styles.disabled}`} />;

          const key = day.toISOString().split("T")[0];
          const dayRecords = records.filter((r) => r.date === key);

          const isSingle = dayRecords.length === 1;
          const hasRecord = dayRecords.length > 0;

          return (
            <div
              key={key}
              className={`${styles.dateCell} ${hasRecord ? styles.hasRecord : ""}`}
              onClick={() => handleDateClick(day)}
            >
              <div className={styles.dateNumber}>{day.getDate()}</div>

              {isSingle && (
                <img
                  src={dayRecords[0].book?.image}
                  className={styles.bigThumbnail}
                />
              )}

              {/* 여러 권 스타일 */}
              {!isSingle && hasRecord && (
                <div className={styles.stackGroup}>
                  {dayRecords.slice(0, 3).map((rec, i) => (
                    <img
                      key={rec._id}
                      src={rec.book?.image}
                      className={styles.stackItem}
                      style={{ zIndex: 10 - i }}
                    />
                  ))}

                  {/* 4권 이상일 때 +N 표시 */}
                  {dayRecords.length > 3 && (
                    <span className={styles.moreBadge}>
                      +{dayRecords.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 모달 */}
      {modalMode !== null && (
        <Modal onClose={() => setModalMode(null)}>
          {modalMode === "record" && (
            <ModalRecordView
              records={records.filter((r) => r.date === selectedDate)}
              onDelete={handleDelete}
              onAddClick={() => setModalMode("select")}
            />
          )}

          {modalMode === "select" && <ModalSelectView onSelect={handleSelect} />}
        </Modal>
      )}
    </div>
  );
};

export default ReadingCalendar;
