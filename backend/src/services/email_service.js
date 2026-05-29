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

// Helper for sending via HTTP API (bypass SMTP port block on Render Free Tier)
const sendViaHttp = async (url, options) => {
  if (typeof fetch !== "undefined") {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }
    return data;
  } else {
    const https = require("https");
    const { URL } = require("url");
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        method: options.method || "POST",
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: options.headers,
      };

      const req = https.request(reqOptions, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(data.message || body));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`HTTP Error ${res.statusCode}: ${body}`));
            }
          }
        });
      });

      req.on("error", (err) => reject(err));
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }
};

// Verify transporter connection on startup
(async () => {
  if (process.env.BREVO_API_KEY) {
    console.log("Email xızmeti: Brevo (HTTP API) saylanıp tur.");
  } else if (process.env.RESEND_API_KEY) {
    console.log("Email xızmeti: Resend (HTTP API) saylanıp tur.");
  } else {
    try {
      const transporter = await createTransporter();
      await transporter.verify();
      console.log("Email server tayar (IPv4 arqalı)!");
    } catch (error) {
      console.log("Email qatesi:", error.message || error);
    }
  }
})();

const sendOTPEmail = async (toEmail, code) => {
  const htmlContent = `
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
    `;

  const subject = `Tastıyıqlaw kodi: ${code}`;

  if (process.env.BREVO_API_KEY) {
    console.log(`[Email] Jiberilmekte (Brevo HTTP API arqalı): ${toEmail}`);
    return sendViaHttp("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "ProSecurity System",
          email: process.env.EMAIL_USER || "no-reply@prosecurity.com",
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });
  }

  if (process.env.RESEND_API_KEY) {
    console.log(`[Email] Jiberilmekte (Resend HTTP API arqalı): ${toEmail}`);
    return sendViaHttp("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ProSecurity System <${process.env.EMAIL_USER || "onboarding@resend.dev"}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      }),
    });
  }

  // Fallback to standard SMTP (Gmail)
  console.log(`[Email] Jiberilmekte (SMTP arqalı): ${toEmail}`);
  const transporter = await createTransporter();
  const mailOptions = {
    from: `"ProSecurity System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    text: `Siziń tastıyıqlaw kodıńız: ${code}`,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
