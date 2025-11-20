import mongoose from "mongoose";

const ReadingRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 캘린더에서 클릭해서 저장한 날짜
    date: {
      type: String, // "2025-11-03" 같은 형식
      required: true,
    },

    bookIsbn: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ReadingRecord", ReadingRecordSchema);
