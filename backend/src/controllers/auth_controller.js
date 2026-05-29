const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mfa_service = require("../services/mfa_service");
const qrcode = require("qrcode");
const { sendOTPEmail } = require("../services/email_service");

/**
 * Yordamchi funksiya: Tizimdagi har bir muhim harakatni
 * audit_logs jadvaliga IP va brauzer ma'lumotlari bilan saqlaydi.
 */
const saveLog = async (userId, action, req) => {
  try {
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      console.warn(`User with id ${userId} not found, skipping audit log: ${action}`);
      return;
    }
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ua = req.headers["user-agent"];
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
      [userId, action, ip, ua],
    );
  } catch (err) {
    console.error("Audit log saqlawda qáte:", err);
  }
};

/**
 * 1. Yangi foydalanuvchini ro'yxatdan o'tkazish
 */
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // 1. Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Bazaga kiritish
    const insertResult = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, email],
    );
    const newUserId = insertResult.rows[0].id;

    // 3. Muvaffaqiyatli bo'lsa log saqlash
    await saveLog(newUserId, "USER_REGISTERED", req);

    // Avtomatik kirish uchun JWT token yaratish
    const token = jwt.sign(
      { id: newUserId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "Tabıslı dizimnen óttińiz",
      token,
      user: {
        id: newUserId,
        username,
        email,
        mfa_enabled: false,
        email_mfa_enabled: false
      }
    });
  } catch (err) {
    // --- TAKRORLANISHNI TEKSHIRISH (MUHIM QISM) ---
    if (err.code === "23505") {
      // 23505 - PostgreSQL dagi Unique Violation (takrorlanish) kodi

      if (err.detail.includes("email")) {
        return res
          .status(400)
          .json({ error: "Bul elektron pochta mánzili álleqashan dizimnen ótken!" });
      }

      if (err.detail.includes("username")) {
        return res
          .status(400)
          .json({ error: "Bul paydalanıwshı atı (username) bánt!" });
      }
    }
    // ---------------------------------------------

    console.error("Registratsiyada qate:", err);
    res.status(500).json({ error: "Serverde kútilmegen qáte júz berdi." });
  }
};

/**
 * 2. Email orqali bir martalik OTP kod yuborish (Backup MFA)
 */
exports.requestEmailOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId],
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "Paydalanıwshı tabılmadı" });

    const email = userResult.rows[0].email;
    if (!email)
      return res
        .status(400)
        .json({ message: "Paydalanıwshı elektron pochtası sazlanbaǵan" });

    // 6 xonali tasodifiy kod yaratish
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60000); // 5 daqiqa amal qiladi

    await pool.query(
      "UPDATE users SET email_otp = $1, email_otp_expires = $2 WHERE id = $3",
      [otp, expires, userId],
    );

    // Email yuborish
    await sendOTPEmail(email, otp);
    await saveLog(userId, "EMAIL_OTP_REQUESTED", req);

    res.json({ message: "Tastıyıqlaw kodı elektron pochtanızǵa jiberildi" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Elektron pochta jiberiw sistemasında texnikalıq qátelik",
      });
  }
};

/**
 * 3. Email orqali yuborilgan OTP kodni tekshirish va kirish
 */
exports.verifyEmailOTP = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND email_otp = $2 AND email_otp_expires > NOW()",
      [userId, otp],
    );

    if (result.rows.length === 0) {
      await saveLog(userId, "EMAIL_OTP_FAILED", req);
      return res
        .status(400)
        .json({ message: "Kod nadurıs yamasa múddeti ótken" });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Xavfsizlik uchun ishlatilgan kodni o'chirish
    await pool.query("UPDATE users SET email_otp = NULL WHERE id = $1", [
      userId,
    ]);
    await saveLog(userId, "LOGIN_SUCCESS_VIA_EMAIL", req);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        mfa_enabled: user.mfa_enabled,
        email_mfa_enabled: user.email_mfa_enabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};

/**
 * 4. Asosiy login (1-bosqich: Login va Parol)
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: "Login yamasa parol qáte" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await saveLog(user.id, "LOGIN_FAILED_WRONG_PASSWORD", req);
      return res.status(401).json({ message: "Login yamasa parol qáte" });
    }

    // Ikki bosqichli autentifikatsiya (TOTP yoki Email 2FA) yoqilgan bo'lsa
    if (user.mfa_enabled || user.email_mfa_enabled) {
      await saveLog(user.id, "LOGIN_STEP_1_SUCCESS", req);
      return res.json({
        mfaRequired: true,
        userId: user.id,
        totpRequired: !!user.mfa_enabled,
        emailRequired: !!user.email_mfa_enabled
      });
    }

    // MFA yoqilmagan bo'lsa, to'g'ridan-to'g'ri token berish
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    await saveLog(user.id, "LOGIN_SUCCESS_WITHOUT_MFA", req);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        mfa_enabled: user.mfa_enabled,
        email_mfa_enabled: user.email_mfa_enabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Sistemaǵa kiriwde kútilmegen qáte" });
  }
};

/**
 * 5. TOTP (Google Authenticator) kodini tekshirish (2-bosqich)
 */
exports.verifyMFALogin = async (req, res) => {
  const { userId, token } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Paydalanıwshı tabılmadı" });
    }
    const user = result.rows[0];

    const isValid = mfa_service.verifyMFAToken(token, user.mfa_secret);
    if (!isValid) {
      await saveLog(userId, "MFA_TOTP_FAILED", req);
      return res.status(400).json({ message: "Kod qáte, qaytadan urınıń." });
    }

    const fullToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    await saveLog(userId, "LOGIN_SUCCESS_VIA_TOTP", req);
    res.json({
      token: fullToken,
      user: {
        id: user.id,
        username: user.username,
        mfa_enabled: user.mfa_enabled,
        email_mfa_enabled: user.email_mfa_enabled
      },
    });
  } catch (err) {
    res.status(500).json({ error: "MFA tekseriwdegi qátelik" });
  }
};

/**
 * 6. Audit loglarni olish (Foydalanuvchi o'z tarixini ko'rishi uchun)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 15",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Maǵlıwmatlardı júklewde qáte" });
  }
};

/**
 * 7. MFA ni sozlash (QR kod generatsiya qilish)
 */
exports.setupMFA = async (req, res) => {
  try {
    const { secret, otpauth } = mfa_service.generateMFASecret(
      req.user.username,
    );
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Secretni bazaga vaqtincha saqlash
    await pool.query("UPDATE users SET mfa_secret = $1 WHERE id = $2", [
      secret,
      req.user.id,
    ]);

    res.json({ qrCode: qrCodeUrl });
  } catch (err) {
    res.status(500).json({ error: "QR kod jaratıwda qáte" });
  }
};

/**
 * 8. MFA ni tasdiqlash va butunlay yoqish
 */
exports.verifyAndEnableMFA = async (req, res) => {
  const { token } = req.body;
  try {
    const result = await pool.query(
      "SELECT mfa_secret FROM users WHERE id = $1",
      [req.user.id],
    );
    const isValid = mfa_service.verifyMFAToken(
      token,
      result.rows[0].mfa_secret,
    );

    if (isValid) {
      await pool.query("DELETE FROM recovery_codes WHERE user_id = $1", [
        req.user.id,
      ]);

      await pool.query("UPDATE users SET mfa_enabled = true WHERE id = $1", [
        req.user.id,
      ]);

      // Zaxira kodlarini (Recovery codes) yaratish
      const codes = mfa_service.generateRecoveryCodes();
      for (let code of codes) {
        const hashed = await bcrypt.hash(code, 10);
        await pool.query(
          "INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)",
          [req.user.id, hashed],
        );
      }
      await saveLog(req.user.id, "MFA_ACTIVATED_SUCCESSFULLY", req);
      res.json({ success: true, recoveryCodes: codes });
    } else {
      res.status(400).json({ message: "Tastıyıqlaw kodı nadurıs" });
    }
  } catch (err) {
    res.status(500).json({ error: "MFA aktivlestiriwdegi qáte" });
  }
};

/**
 * 9. MFA ni o'chirish (Tasdiqlash talab qilinadi)
 */
exports.disableMFA = async (req, res) => {
  const { token } = req.body;
  try {
    const result = await pool.query(
      "SELECT mfa_secret FROM users WHERE id = $1",
      [req.user.id],
    );
    const isValid = mfa_service.verifyMFAToken(
      token,
      result.rows[0].mfa_secret,
    );

    if (isValid) {
      await pool.query(
        "UPDATE users SET mfa_enabled = false, mfa_secret = null WHERE id = $1",
        [req.user.id],
      );
      // Zaxira kodlarini ham tozalash
      await pool.query("DELETE FROM recovery_codes WHERE user_id = $1", [
        req.user.id,
      ]);
      await saveLog(req.user.id, "MFA_DEACTIVATED", req);
      res.json({ success: true, message: "MFA óshirildi" });
    } else {
      res.status(400).json({ message: "Kod qáte, MFA óshirilmedi" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server qátesi" });
  }
};

// Zaxira (Recovery) kodi orqali kirishni tekshirish
exports.verifyRecoveryCode = async (req, res) => {
  const { userId, recoveryCode } = req.body;
  try {
    // Bazadan ushbu foydalanuvchiga tegishli va hali ishlatilmagan kodlarni olamiz
    const result = await pool.query(
      "SELECT * FROM recovery_codes WHERE user_id = $1 AND used = false",
      [userId],
    );
    const codes = result.rows;

    let matchedCodeId = null;
    for (let item of codes) {
      // Kelgan kodni shifrlangan kod bilan solishtiramiz
      const isMatch = await bcrypt.compare(recoveryCode, item.code_hash);
      if (isMatch) {
        matchedCodeId = item.id;
        break;
      }
    }

    if (matchedCodeId) {
      // Kodni ishlatilgan deb belgilaymiz (bir marta ishlatish uchun)
      await pool.query("UPDATE recovery_codes SET used = true WHERE id = $1", [
        matchedCodeId,
      ]);

      const userResult = await pool.query(
        "SELECT id, username, mfa_enabled, email_mfa_enabled FROM users WHERE id = $1",
        [userId],
      );
      const user = userResult.rows[0];

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      await saveLog(userId, "LOGIN_SUCCESS_VIA_RECOVERY_CODE", req);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          mfa_enabled: user.mfa_enabled,
          email_mfa_enabled: user.email_mfa_enabled
        }
      });
    } else {
      await saveLog(userId, "RECOVERY_CODE_FAILED", req);
      res
        .status(400)
        .json({
          message: "Qosımsha kod nadurıs yamasa álleqashan paydalanılǵan",
        });
    }
  } catch (err) {
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, mfa_enabled, email_mfa_enabled FROM users WHERE id = $1",
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Paydalanıwshı tabılmadı" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};

/**
 * Email 2FA sozlash: OTP kod yuborish
 */
exports.setupEmailMFA = async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [req.user.id],
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "Paydalanıwshı tabılmadı" });

    const email = userResult.rows[0].email;
    if (!email)
      return res
        .status(400)
        .json({ message: "Paydalanıwshı elektron pochtası sazlanbaǵan" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60000); // 5 daqiqa

    await pool.query(
      "UPDATE users SET email_otp = $1, email_otp_expires = $2 WHERE id = $3",
      [otp, expires, req.user.id],
    );

    await sendOTPEmail(email, otp);
    await saveLog(req.user.id, "EMAIL_MFA_SETUP_REQUESTED", req);

    res.json({ message: "Tastıyıqlaw kodı elektron pochtanızǵa jiberildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};

/**
 * Email 2FA ni tasdiqlash va yoqish
 */
exports.enableEmailMFA = async (req, res) => {
  const { token } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND email_otp = $2 AND email_otp_expires > NOW()",
      [req.user.id, token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Kod nadurıs yamasa múddeti ótken" });
    }

    await pool.query(
      "UPDATE users SET email_mfa_enabled = true, email_otp = NULL WHERE id = $1",
      [req.user.id],
    );

    await saveLog(req.user.id, "EMAIL_MFA_ENABLED", req);
    res.json({ success: true, message: "Email 2FA jaǵıldı" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};

/**
 * Email 2FA ni o'chirish
 */
exports.disableEmailMFA = async (req, res) => {
  try {
    await pool.query(
      "UPDATE users SET email_mfa_enabled = false WHERE id = $1",
      [req.user.id],
    );

    await saveLog(req.user.id, "EMAIL_MFA_DISABLED", req);
    res.json({ success: true, message: "Email 2FA óshirildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverde qáte júz berdi." });
  }
};
