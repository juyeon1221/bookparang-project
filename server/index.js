import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import booksRouter from "./routes/books.js";
import reviewRoutes from "./routes/review.js";
import wishlistRoutes from "./routes/wishlists.js";
import cartRoutes from "./routes/carts.js";
import purchaseRoutes from "./routes/purchases.js";
import inquiryRoutes from "./routes/inquiry.js";
import reportRoutes from "./routes/reports.js";
import readingRecordRoutes from "./routes/readingRecord.js"
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("⭐ API_BASE_URL =", process.env.API_BASE_URL); 
console.log("⭐ CLIENT_URL =", process.env.CLIENT_URL);

const app = express();
const PORT = 4000;

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads 폴더 자동 생성 완료");
}

// ✅ CORS 설정 (쿠키 포함)
app.use(
  cors({
    origin: process.env.CLIENT_URL, // 프론트 주소
    credentials: true, // 쿠키 허용
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("🌍 들어온 요청:", req.method, req.originalUrl);
  next();
});


// ✅ MongoDB 연결
mongoose
  .connect("mongodb://zoomedia.synology.me:27017/myapp_1g", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ 라우트 설정
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/books", booksRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reading-record", readingRecordRoutes);
app.use("/api/auth", userRoutes);

// ✅ 알라딘 API 프록시
app.get("/api/aladin", async (req, res) => {
  const { isbn } = req.query;
  if (!isbn) return res.status(400).json({ error: "ISBN is required" });

  try {
    const response = await axios.get("https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx", {
      params: {
        TTBKey: process.env.VITE_ALADIN_TTB_KEY,
        ItemIdType: "ISBN13",
        ItemId: isbn,
        Output: "JS",
        Version: "20131101",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Aladin API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch data from Aladin API" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${process.env.CLIENT_URL}`);
});
