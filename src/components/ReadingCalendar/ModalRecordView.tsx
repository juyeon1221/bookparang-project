import React from "react";
import styles from "./ReadingCalendar.module.css";

const ModalRecordView = ({ records, onDelete, onAddClick }) => {
  return (
    <div className={styles.recordView}>
      <h3 className={styles.modalTitle}>기록된 책</h3>

      {records.length === 0 && (
        <p className={styles.noBooks}>아직 기록된 책이 없어요.</p>
      )}

      {records.map((rec) => (
        <div key={rec._id} className={styles.recordItem}>
          <img src={rec.book?.image} className={styles.recordItemImage} />

          <div className={styles.recordText}>
            <div className={styles.bookTitle}>{rec.book?.title}</div>
            <div className={styles.bookAuthor}>{rec.book?.author}</div>
          </div>

          <button className={styles.deleteBtn} onClick={() => onDelete(rec._id)}>
            x
          </button>
        </div>
      ))}

      <button className={styles.addBtn} onClick={onAddClick}>
        + 책 추가하기
      </button>
    </div>
  );
};

export default ModalRecordView;
