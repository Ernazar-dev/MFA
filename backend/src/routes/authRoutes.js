const express = require("express");
const router = express.Router();
const auth_controller = require("../controllers/auth_controller");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

/**
 * 1. Brute-Force ga qarshi maxsus cheklovlar
 */

// Login va Register uchun qat'iy cheklov (15 daqiqada 5 urinish)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Universitet loyihasi testlari uchun 10 ta qilindi
  message:
    "Qáwipsizlik maqsetinde urınıwlar sanı sheklendi. 15 minuttan keyin qayta urınıń.",
});

// Email OTP so'rash uchun cheklov
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 10,
  message: "Xat jiberiw sanı sheklendi.",
});

/**
 * 2. Ma'lumotlar validatsiyasi (SQL Injection va noto'g'ri formatdan himoya)
 */
const validateRegister = [
  body("username")
    .isAlphanumeric()
    .withMessage("Username tek hárip hám cifrlardan ibarat bolıwı kerek")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username 3 ten 20 ǵa shekem belgiden ibarat bolıwı shárt.")
    .trim()
    .escape(),
  body("email")
    .isEmail()
    .withMessage("Nadurıs elektron pochta formatı")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Parol keminde 8 belgiden ibarat bolıwı shárt.")
    .matches(/\d/)
    .withMessage("Parolda keminde bir san bolıwı shárt.")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateLogin = [
  body("username")
    .notEmpty()
    .withMessage("Username bos bolıwı múmkin emes")
    .trim()
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Parol bos bolıwı múmkin emes")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

/**
 * 3. API Marshrutlari
 */

// Ochiq kirish yo'llari
router.post(
  "/register",
  authLimiter,
  validateRegister,
  auth_controller.register,
);
router.post("/login", authLimiter, validateLogin, auth_controller.login);

// MFA va Tasdiqlash yo'llari
router.post("/mfa/verify-login", authLimiter, auth_controller.verifyMFALogin);
router.post(
  "/mfa/verify-recovery",
  authLimiter,
  auth_controller.verifyRecoveryCode,
);
router.post(
  "/mfa/request-email-otp",
  emailLimiter,
  auth_controller.requestEmailOTP,
);
router.post(
  "/mfa/verify-email-otp",
  authLimiter,
  auth_controller.verifyEmailOTP,
);

// Avtorizatsiya talab qiladigan yo'llar (Token kerak)
router.get("/me", authMiddleware, auth_controller.getMe);
router.get("/mfa/setup", authMiddleware, auth_controller.setupMFA);
router.post(
  "/mfa/verify-enable",
  authMiddleware,
  auth_controller.verifyAndEnableMFA,
);
router.post("/mfa/disable", authMiddleware, auth_controller.disableMFA);
router.post("/mfa/email/setup", authMiddleware, auth_controller.setupEmailMFA);
router.post("/mfa/email/enable", authMiddleware, auth_controller.enableEmailMFA);
router.post("/mfa/email/disable", authMiddleware, auth_controller.disableEmailMFA);
router.get("/audit-logs", authMiddleware, auth_controller.getAuditLogs);

module.exports = router;
