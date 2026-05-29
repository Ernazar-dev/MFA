# MFA (Multi-Factor Authentication) Loyihasi / MFA Project

Bu loyiha React (Frontend) va Node.js + Express + PostgreSQL (Backend) texnologiyalari yordamida yaratilgan ikki bosqichli xavfsizlik (MFA - Multi-Factor Authentication) tizimidir.

---

## 🔴 Xatolik nimada? / Qate nege kelip shıqtı?

Sizdagi **`Registratsiyada qate: error: отношение "users" не существует`** xatoligi PostgreSQL ma'lumotlar bazasida **`users`** (foydalanuvchilar) jadvali (table) mavjud emasligini bildiradi. 

Tizim ishlashi uchun ma'lumotlar bazasida tegishli jadvallar (`users`, `audit_logs` va `recovery_codes`) yaratilgan bo'lishi kerak.

---

## 🛠 Tuzatish bosqichlari / Ońlaw basqıshları

Jadvallarni yaratish uchun quyidagi qadamlarni bajaring:

1. **PostgreSQL** (masalan, pgAdmin yoki terminal) orqali ma'lumotlar bazangizga kiring.
2. Yangi ma'lumotlar bazasi (Database) yarating. Nomi backend `.env` faylida ko'rsatilganidek bo'lishi kerak: **`mfa-project`**.
3. **Backend-ni ishga tushiring.** Backend ishga tushganida `database.sql` faylidagi barcha jadvallarni (`users`, `audit_logs`, `recovery_codes`) avtomatik ravishda o'zi yaratadi! (Query Tool orqali qo'lda yozib o'tirish shart emas).


Ushbu SQL kodlar quyidagi jadvallarni yaratadi:
* **`users`** — foydalanuvchilar ma'lumotlari, MFA sozlamalari va pochta kodlarini saqlash uchun.
* **`audit_logs`** — tizimdagi harakatlar tarixi (IP-manzil, brauzer ma'lumotlari) uchun.
* **`recovery_codes`** — MFA yoqilganda beriladigan zaxira tiklash kodlarini saqlash uchun.

---

## 🚀 Loyihani o'rnatish va ishga tushirish / Project Setup & Running

Loyihani to'liq ishga tushirish uchun quyidagi ko'rsatmalarga amal qiling:

### 1. Ma'lumotlar bazasi va muhit sozlamalari (Configuration)

Backend papkasida [backend/.env](file:///D:/%20ERNAZAR%20OBSH/OBSH%20KODLAR/IP-tayinlar/Beka/backend/.env) fayli mavjud. U yerda o'zingizning PostgreSQL va Email server ma'lumotlaringizni to'g'ri sozlang:

```env
PORT=5000
DB_USER=postgres            # PostgreSQL foydalanuvchi nomi
DB_PASSWORD=your_password   # PostgreSQL paroli
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mfa-project         # Ma'lumotlar bazasi nomi
JWT_SECRET=your_jwt_secret  # Istalgan maxfiy kalit so'z

# Email orqali OTP yuborish xizmati uchun (Gmail misolida)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password # Gmail App Password (oddiy parol emas)
```

---

### 2. Backend-ni ishga tushirish

Terminalda `backend` papkasiga o'ting, kutubxonalarni o'rnating va serverni yoqing:

```bash
# Backend papkasiga o'tish
cd backend

# Kutubxonalarni o'rnatish
npm install

# Loyihani rivojlantirish (development) rejimida ishga tushirish
npm run dev
```

*Server muvaffaqiyatli ishga tushgach, terminalda quyidagi xabarlar chiqadi:*
* `Server 5000-portta juwırıp atır...`
* `Email server tayar (IPv4 arqalı)!`

---

### 3. Frontend-ni ishga tushirish

Boshqa terminal oynasini ochib, `frontend` papkasiga o'ting va loyihani yoqing:

```bash
# Frontend papkasiga o'tish
cd frontend

# Kutubxonalarni o'rnatish
npm install

# Loyihani ishga tushirish
npm run dev
```

*Frontend odatda `http://localhost:5173` manzilida ishga tushadi.*

---

## 📁 Loyiha tuzilishi / Project Directory Structure

```text
Beka/
├── backend/
│   ├── src/
│   │   ├── config/       # Ma'lumotlar bazasi ulanishi (db.js)
│   │   ├── controllers/  # Logikalar (auth_controller.js)
│   │   ├── middleware/   # JWT va xavfsizlik middleware
│   │   ├── routes/       # API yo'llari (authRoutes.js)
│   │   ├── services/     # OTP, MFA va Email jo'natish xizmatlari
│   │   └── app.js        # Express ilovasi konfiguratsiyasi
│   ├── database.sql      # Database jadvallarini yaratish uchun SQL kodlar
│   ├── server.js         # Backendni ishga tushiruvchi kirish nuqtasi
│   └── .env              # Muhit konfiguratsiya fayli
└── frontend/
    ├── src/
    │   ├── api/          # Axios ulanishi (api/axios.js)
    │   ├── components/   # UI komponentlari
    │   ├── pages/        # Login, Register, Dashboard, MFA sahifalari
    │   └── App.jsx       # Boshqaruvchi asosiy React komponenti
```
