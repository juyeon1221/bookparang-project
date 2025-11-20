import { Routes, Route, useLocation } from "react-router-dom";
import "./styles/reset.css";
import "./styles/variables.css";
import LoginPage from "./pages/LoginPage/LoginPage";
import { AuthProvider } from "./context/AuthProvider";
import CartPage from "./pages/CartPage/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage/PurchaseSuccessPage";
import EventPage from "./pages/EventPage/EventPage";
import EventDetailPage from "./pages/EventDetailPage/EventDetailPage";
import Header from "./components/Header/Header";
import BestSellerPage from "./pages/BestSellerPage/BestSellerPage";
import NewBookPage from "./pages/NewBookPage/NewBookPage";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import FontSizeToggle from "./components/FontSizeToggle/FontSizeToggle";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import SearchResultsPage from "./pages/SearchResultsPage/SearchResultsPage";
import MainPage from "./pages/MainPage/MainPage";
import BookInfoPage from "./pages/BookInfoPage/BookInfoPage";
import Footer from "./components/Footer/Footer";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import MyReview from "./pages/MyReview/MyReview";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import InquiryPage from "./pages/InquiryPage/InquiryPage";
import MobileNav from "./components/MobileNav/MobileNav";
import TermAgreement from "./components/TermAgreement/TermAgreement";
import PrivacyConsent from "./components/PrivacyConsent/PrivacyConsent";
import MarketingConsent from "./components/MarketingConsent/MarketingConsent";
import CategoryPage from "./pages/CategoryPage/CategoryPage";

function App() {
  const location = useLocation();

  const hideFooterPaths = ["/bestseller", "/new", "/category"];
  const shouldHideFooter = hideFooterPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <AuthProvider>
      <Header />
      <MobileNav />

      <div
        style={{
          position: "fixed",
          bottom: "40px",
          right: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <ThemeToggle />
        <FontSizeToggle />
        <ScrollToTopButton />
      </div>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bestseller" element={<BestSellerPage />} />
        <Route path="/new" element={<NewBookPage />} />
        <Route path="/book/:isbn" element={<BookInfoPage />} />
        <Route path="/my" element={<MyReview />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/purchase" element={<PurchaseSuccessPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/category" element={<CategoryPage />} />

        <Route path="/terms" element={<TermAgreement />} />
        <Route path="/privacy" element={<PrivacyConsent />} />
        <Route path="/marketing" element={<MarketingConsent />} />


        {/* ✅ 관리자 전용 라우트 */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>

      {!shouldHideFooter && <Footer />}
    </AuthProvider>
  );
}

export default App;
