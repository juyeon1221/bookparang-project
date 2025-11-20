import { useState, useRef } from "react";
import axios from "axios";

const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string;

const API = import.meta.env.VITE_API_URL ?? "";

/* -------------------- 타입 정의 -------------------- */
export interface AladinBookDetail {
  listPrice?: number;
  salePrice?: number;
  discountRate?: number;
  reviewRank?: number;
  link?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface KakaoBook {
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

export interface BookData {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  thumbnail: string;
  listPrice: number | string;
  salePrice: number | string;
  discountRate: number | string;
  reviewRank: number;
  link: string;
  categoryId?: number;
  categoryName?: string;
  pubDate?: string;
}

/* -------------------- 디바운스 -------------------- */
function useDebounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void | Promise<void>,
  delay = 500
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void func(...args);
    }, delay);
  };
}

/* -------------------- 병렬 호출 제한 유틸 -------------------- */
async function chunkedPromiseAll<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<Awaited<R>[]> {
  const result: Awaited<R>[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const slice = items.slice(i, i + limit);
    const settled = await Promise.allSettled(slice.map(fn));
    result.push(
      ...settled
        .filter(
          (r): r is PromiseFulfilledResult<Awaited<R>> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value)
    );
  }
  return result;
}

/* -------------------- 메인 훅 -------------------- */
export default function useBookSearchWithAutoComplete() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSearchingRef = useRef(false);
  const lastQueryRef = useRef<string>("");

  /* ------------------- 자동완성 ------------------- */
  const fetchSuggestions = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get<KakaoBookResponse>(
        "https://dapi.kakao.com/v3/search/book",
        {
          params: { query, size: 5 },
          headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
        }
      );

      const titles = res.data.documents.map((book) => book.title);
      setSuggestions(titles);
    } catch (err) {
      console.error("❌ 자동완성 실패:", err);
      setSuggestions([]);
    }
  };

  const debouncedFetch = useDebounce(fetchSuggestions, 300);

  /* ------------------- 검색 ------------------- */
  const searchBooks = async (query: string): Promise<void> => {
    if (!query.trim() || isSearchingRef.current || lastQueryRef.current === query)
      return;

    isSearchingRef.current = true;
    lastQueryRef.current = query;
    setLoading(true);
    setError(null);

    try {
      const kakaoRes = await axios.get<KakaoBookResponse>(
        "https://dapi.kakao.com/v3/search/book",
        {
          params: { query, size: 30 },
          headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
        }
      );

      const kakaoBooks = kakaoRes.data.documents;

      const enrichedBooks = await chunkedPromiseAll<KakaoBook, BookData>(
        kakaoBooks,
        5, // 병렬 호출 제한
        async (book) => {
          const isbn = book.isbn.split(" ")[1] || book.isbn.split(" ")[0];

          // ✅ 출판일 가공 (카카오 데이터에서 바로)
          const formattedDate = book.datetime
            ? new Date(book.datetime).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            : "정보 없음";

          try {
            const aladinRes = await axios.get<AladinBookDetail>(
              `${API}/api/books/aladin`,
              { params: { isbn } }
            );

            const detail = aladinRes.data;

            return {
              id: isbn,
              title: book.title,
              authors: book.authors?.join(", "),
              publisher: book.publisher,
              thumbnail: book.thumbnail,
              listPrice: detail.listPrice ?? book.price ?? "정보 없음",
              salePrice: detail.salePrice ?? book.sale_price ?? "정보 없음",
              discountRate: detail.discountRate ?? "정보 없음",
              reviewRank: detail.reviewRank ?? 0,
              link: detail.link ?? book.url,
              categoryId: detail.categoryId ?? 0,
              categoryName: detail.categoryName ?? "기타",
              pubDate: formattedDate,
            };
          } catch {
            return {
              id: isbn,
              title: book.title,
              authors: book.authors?.join(", "),
              publisher: book.publisher,
              thumbnail: book.thumbnail,
              listPrice: book.price ?? "정보 없음",
              salePrice: book.sale_price ?? "정보 없음",
              discountRate: "정보 없음",
              reviewRank: 0,
              link: book.url,
              categoryId: 0,
              categoryName: "기타",
              pubDate: formattedDate, // ✅ 실패해도 포함
            };
          }
        }
      );

      setBooks(enrichedBooks);
    } catch (err) {
      console.error("❌ 검색 실패:", err);
      setError("책 정보를 불러오지 못했습니다 😢");
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  return {
    books,
    suggestions,
    loading,
    error,
    fetchSuggestions: debouncedFetch,
    searchBooks: useDebounce(searchBooks, 500),
  };
}
