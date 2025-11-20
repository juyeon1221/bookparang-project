import { useState } from "react";
import axios from "axios";

const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string;

export interface BookData {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  thumbnail: string;
  listPrice: number | string;  // 📘 정가
  salePrice: number | string;  // 💸 판매가
  discountRate: number | string; // 📉 할인율 (옵션)
  reviewRank: number;
  link: string;
}

interface KakaoBook {
  title: string;
  contents: string;
  url: string;
  isbn: string;
  datetime: string;
  authors: string[];
  publisher: string;
  translators: string[];
  price: number;
  sale_price: number;
  thumbnail: string;
  status: string;
}

interface KakaoBookResponse {
  documents: KakaoBook[];
}

export default function useBookSearch() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  const searchBooks = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // ✅ 카카오 API: 기본 검색
      const kakaoRes = await axios.get<KakaoBookResponse>(
        "https://dapi.kakao.com/v3/search/book",
        {
          params: { query, size: 10 },
          headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
        }
      );

      const kakaoBooks = kakaoRes.data.documents;

      // ✅ 알라딘 API 데이터로 상세정보 보강
      const enrichedBooks: BookData[] = await Promise.all(
        kakaoBooks.map(async (book) => {
          const isbn = book.isbn.split(" ")[1] || book.isbn.split(" ")[0];

          try {
            const aladinRes = await axios.get(`${API}/api/aladin`, {
              params: { isbn },
            });

            // ✅ 이제 서버가 가공한 형태로 응답하므로, 그대로 구조분해 가능
            const detail = aladinRes.data;

            return {
              id: isbn,
              title: book.title,
              authors: book.authors?.join(", "),
              publisher: book.publisher,
              thumbnail: book.thumbnail,
              listPrice: detail.listPrice || book.price || "정보 없음",
              salePrice: detail.salePrice || book.sale_price || "정보 없음",
              discountRate: detail.discountRate || "정보 없음",
              reviewRank: detail.reviewRank || 0,
              link: detail.link || book.url,
            };
          } catch {
            // 알라딘 API 실패 시 카카오 기본정보 사용
            return {
              id: isbn,
              title: book.title,
              authors: book.authors?.join(", "),
              publisher: book.publisher,
              thumbnail: book.thumbnail,
              listPrice: book.price || "정보 없음",
              salePrice: book.sale_price || "정보 없음",
              discountRate: "정보 없음",
              reviewRank: 0,
              link: book.url,
            };
          }
        })
      );

      setBooks(enrichedBooks);
    } catch (err) {
      setError("책 정보를 불러오지 못했습니다 😢");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, error, searchBooks };
}
