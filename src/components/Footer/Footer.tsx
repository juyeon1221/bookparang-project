import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";
import logo from "../Footer/logo.png";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* 왼쪽 : 로고 + 회사정보 */}
        <div className={styles.companySection}>
          <img src={logo} alt="로고" className={styles.logo} />
          <div className={styles.companyInfo}>
            <p className={styles.companyName}>북파랑</p>
            <div className={styles.companycontents}>
              <p>대표 : 파랑새 (홍연진, 김주연, 장다은)</p>
              <p>주소 : ㅇㅇ시 ㅇㅇ구 ㅇㅇ로 1, 1층(ㅇㅇ동,ㅇㅇ빌딩)</p>
              <p>사업자등록번호 : 000-00-00000  통신판매업신고 : 제 0000-00000호</p>
              <p>Copyright ⓒ Corp. All Rights Reserved.</p>
            </div>
          </div>
        </div>

        {/* 가운데 : 고객센터 */}
        <div className={styles.csSection}>
          <p className={styles.csTitle}>고객 문의</p>
          <div className={styles.cs}>
            <p className={styles.csPhone}>123-456-7890</p>
            <p className={styles.csTime}>평일 9시 ~ 18시 (토요일, 일요일, 공휴일 휴무)</p>
          </div>

          <div className={styles.csButtons}>
            {/* ✅ 활성화된 버튼 */}
            <button onClick={() => navigate("/inquiry")}>1:1 문의하기</button>
            <button onClick={() => navigate("/inquiry")}>자주 묻는 질문</button>

            {/* 🚫 비활성화된 버튼 */}
            <button disabled className={styles.disabledBtn}>
              환불 신청
            </button>
          </div>
        </div>
      </div>

      {/* 하단 메뉴 */}
      <ul className={styles.footerMenu}>
        {/* ✅ 클릭 시 페이지 이동 */}
        <li onClick={() => navigate("/terms")} className={styles.linkItem}>
          이용약관
        </li>
        <li onClick={() => navigate("/privacy")} className={styles.linkItem}>
          개인정보처리방침
        </li>

        {/* 🚫 비활성화된 메뉴 */}
        <li className={styles.disabledItem}>청소년보호정책</li>
        <li className={styles.disabledItem}>제휴안내</li>
        <li className={styles.disabledItem}>채용안내</li>
      </ul>
    </footer>
  );
}
