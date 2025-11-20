import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 비밀번호 검증 함수
function validatePassword(password) {
  const basicRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,20}$/;
  if (!basicRule.test(password))
    return "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자여야 합니다.";
  if (/\s/.test(password)) return "비밀번호에 공백은 사용할 수 없습니다.";

  const chars = password.split("");
  for (let i = 0; i < chars.length - 2; i++) {
    const c1 = chars[i].charCodeAt(0);
    const c2 = chars[i + 1].charCodeAt(0);
    const c3 = chars[i + 2].charCodeAt(0);
    if (c2 === c1 + 1 && c3 === c2 + 1) return "3자 이상 연속된 문자는 사용할 수 없습니다.";
    if (chars[i] === chars[i + 1] && chars[i + 1] === chars[i + 2])
      return "같은 문자를 3회 이상 반복할 수 없습니다.";
  }
  return null;
}

// ✅ 회원가입
export const registerUser = async (req, res) => {
  try {
    const { username, userId, password } = req.body;
    if (!username || !userId || !password)
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const existingUser = await User.findOne({ $or: [{ userId }, { nickname: userId }] });
    if (existingUser) return res.status(409).json({ error: "이미 존재하는 ID 또는 닉네임입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      userId,
      password: hashedPassword,
      nickname: userId,
      profileImage: "https://your-default-image-url.com/default-profile.png",
    });

    await newUser.save();
    res.status(201).json({ message: "회원 등록 성공! (기본 프로필 적용)" });
  } catch (error) {
    console.error("❌ User register error:", error.message);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// ✅ 로그인
export const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "존재하지 않는 아이디입니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });

    const token = jwt.sign(
      { _id: user._id, userId: user.userId },
      "mySecretKey",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax", // ✅ 크로스 도메인 허용
      secure: true,   // ✅ 로컬에서는 false, 배포 시 true
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.json({ message: `${user.username}님 로그인 성공!`, token });
  } catch (error) {
    console.error("❌ 로그인 에러:", error.message);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// ✅ 로그아웃
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "로그아웃 성공!" });
};

// ✅ 회원탈퇴
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: "본인만 탈퇴할 수 있습니다." });
    }

    const deletedUser = await User.findOneAndDelete({ userId });
    if (!deletedUser) return res.status(404).json({ error: "해당 사용자를 찾을 수 없습니다." });

    res.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    console.error("❌ 회원 탈퇴 에러:", error.message);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// ✅ 마이페이지 조회
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select("-password");
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
};

// ✅ 닉네임 중복 확인
export const checkNickname = async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname) {
      return res.status(400).json({ error: "닉네임을 입력해주세요." });
    }

    // 닉네임 중복 여부 확인
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
      return res.status(409).json({ error: "이미 사용 중인 닉네임입니다." });
    }

    res.json({ message: "사용 가능한 닉네임입니다." });
  } catch (error) {
    console.error("❌ 닉네임 중복 확인 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// ✅ 회원정보 수정
export const updateUser = async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const updateData = {};

    // ✅ 닉네임 중복 검사 추가
    if (nickname && nickname.trim() !== "") {
      const existingUser = await User.findOne({
        nickname,
        userId: { $ne: req.user.userId }, // 자기 자신은 제외
      });

      if (existingUser) {
        return res.status(409).json({ error: "이미 사용 중인 닉네임입니다." });
      }

      updateData.nickname = nickname;
    }

    // ✅ 프로필 이미지 (multer로 업로드된 경우)
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      updateData.profileImage = imagePath;
    }

    // ✅ 비밀번호 변경 (비어 있으면 무시)
    if (password && password.trim() !== "") {
      const passwordError = validatePassword(password);
      if (passwordError) return res.status(400).json({ error: passwordError });
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ✅ DB 업데이트
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      updateData,
      { new: true }
    ).select("-password");

    res.json({ message: "회원정보 수정 완료!", user: updatedUser });
  } catch (error) {
    console.error("❌ 회원정보 수정 에러:", error.message);
    res.status(500).json({ error: "서버 오류" });
  }
};
