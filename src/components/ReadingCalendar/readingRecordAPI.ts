import axios from "axios";

// 날짜에 책 기록 저장
export const createReadingRecord = async (date: string, bookIsbn: string) => {
  return axios.post("/api/reading-record", { date, bookIsbn });
};

// 특정 날짜 기록 조회
export const getReadingRecordByDate = async (date: string) => {
  return axios.get(`/api/reading-record?date=${date}`);
};

// 모든 날짜 기록 조회 (캘린더 로딩용)
export const getAllReadingRecords = async () => {
  return axios.get("/api/reading-record/all");
};

// 향후 확장 (삭제/수정)
export const deleteReadingRecord = async (id: string) => {
  return axios.delete(`/api/reading-record/${id}`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateReadingRecord = async (id: string, payload: any) => {
  return axios.patch(`/api/reading-record/${id}`, payload);
};
