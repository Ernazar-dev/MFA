const { authenticator } = require("otplib");
const crypto = require("crypto");

// MFA uchun maxfiy kalit va URL yaratish
const generateMFASecret = (username) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(username, "ProSecurity_App", secret);
  return { secret, otpauth };
};

// Kodni tekshirish
const verifyMFAToken = (token, secret) => {
  return authenticator.check(token, secret);
};

// Zaxira kodlarini generatsiya qilish (8 belgili 5 ta kod)
const generateRecoveryCodes = () => {
  const codes = [];
  for (let i = 0; i < 5; i++) {
    codes.push(crypto.randomBytes(4).toString("hex"));
  }
  return codes;
};

module.exports = { generateMFASecret, verifyMFAToken, generateRecoveryCodes };
