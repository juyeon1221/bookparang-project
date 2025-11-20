import Inquiry from "../models/Inquiry.js";

// 사용자 문의 작성
export const createInquiry = async (req, res) => {
  try {
    const { title, content } = req.body;
    const inquiry = new Inquiry({ userId: req.user.userId, title, content });
    await inquiry.save();
    res.status(201).json({ message: "문의가 등록되었습니다." });
  } catch {
    res.status(500).json({ error: "문의 등록 실패" });
  }
};

// 관리자: 문의 목록 확인
export const getAllInquiries = async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(inquiries);
};

// 관리자: 답변 작성
export const answerInquiry = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { answer, status: "answered", answeredAt: new Date() },
    { new: true }
  );
  res.json(inquiry);
};

// 사용자: 내 문의 확인
export const getMyInquiries = async (req, res) => {
  const inquiries = await Inquiry.find({ userId: req.user.userId });
  res.json(inquiries);
};
