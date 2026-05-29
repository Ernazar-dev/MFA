const nodemailer = require("nodemailer");
const dns = require("dns");

// Helper function to resolve "smtp.gmail.com" strictly to an IPv4 address
const getSmtpIpv4 = () => {
  return new Promise((resolve, reject) => {
    dns.resolve4("smtp.gmail.com", (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback to dns.lookup if resolve4 fails
        dns.lookup("smtp.gmail.com", { family: 4 }, (err2, address) => {
          if (err2 || !address) {
            reject(err || err2 || new Error("SMTP host resolution failed"));
          } else {
            resolve(address);
          }
        });
      } else {
        resolve(addresses[0]); // Return the first IPv4 address
      }
    });
  });
};

// Create a transporter helper dynamically
const createTransporter = async () => {
  let host = "smtp.gmail.com";
  try {
    host = await getSmtpIpv4();
    console.log(`[SMTP] Resolved smtp.gmail.com to IPv4: ${host}`);
  } catch (err) {
    console.warn("[SMTP] DNS resolution failed, using default hostname:", err.message);
  }

  return nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000, // 15 soniya kutish
    greetingTimeout: 15000,
    socketTimeout: 15000,
    dnsTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
      servername: "smtp.gmail.com", // Essential for SSL certificate validation with IP host!
    },
  });
};

// Verify transporter connection on startup
(async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log("Email server tayar (IPv4 arqalı)!");
  } catch (error) {
    console.log("Email qatesi:", error.message || error);
  }
})();

const sendOTPEmail = async (toEmail, code) => {
  const transporter = await createTransporter();

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
