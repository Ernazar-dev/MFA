const nodemailer = require("nodemailer");
const dns = require("dns");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL ishlatish
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Custom DNS lookup to strictly force IPv4 and bypass IPv6 on Render
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
  },
  connectionTimeout: 10000, // 10 soniya kutish
  greetingTimeout: 10000,
  socketTimeout: 10000,
  dnsTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Tekshirish uchun
transporter.verify((error, success) => {
  if (error) {
    console.log("Email qatesi:", error);
  } else {
    console.log("Email server tayar (IPv4 arqalı)!");
  }
});

const sendOTPEmail = async (toEmail, code) => {
    const mailOptions = {
        from: `"ProSecurity System" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Tastıyıqlaw kodi: ${code}`, 
        text: `Siziń tastıyıqlaw kodıńız: ${code}`, 
        html: `
            <div style="background-color: #f8fafc; padding: 40px; font-family: 'Inter', sans-serif;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">Qáwipsizlik sisteması</h2>
                    </div>
                    <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                       Sálem! Sistemaǵa kiriw ushın tómendegi bir mártelik tastıyıqlaw kodınan paydalanıń. Bul kod 5 minut dawamında ámel etedi.
                    </p>
                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb;">${code}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
                        Eger bul sorawdı siz jibermegen bolsańız, bul xatqa itibar bermeń.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                   
                </div>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
