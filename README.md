# 🔐 MFA (Multi-Factor Authentication) Proyekti

Bul proyekt React (Frontend) hám Node.js + Express + PostgreSQL (Backend) texnologiyaları járdeminde jaratılǵan eki basqıshlı qáwipsizlik (MFA - Multi-Factor Authentication) sisteması bolıp tabıladı.

---

## 🛠 Proyektti ornatıw hám iske túsiriw

Proyektti tolıq iske túsiriw ushın tómendegi kórsetpelerge ámel etiń:

### 1. Maǵlıwmatlar bazası hám ortalıq sazlawları (Configuration)

1. **PostgreSQL** maǵlıwmatlar bazasın iske túsiriń (pgAdmin yaki terminal arqalı).
2. Jańa maǵlıwmatlar bazasın (Database) jaratıń. Bazanıń atı backend `.env` faylında kórsetilgendey bolıwı kerek: **`mfa-project`**.
3. Backend papkasında [backend/.env](file:///D:/%20ERNAZAR%20OBSH/OBSH%20KODLAR/IP-tayinlar/Beka/backend/.env) faylın ashıń hám ózińizdiń PostgreSQL hám Email server maǵlıwmatlarıńızdı tuwrı sazlań:

```env
PORT=5000
DB_USER=postgres            # PostgreSQL paydalanıwshı atı
DB_PASSWORD=your_password   # PostgreSQL paroli
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mfa-project         # Maǵlıwmatlar bazası atı
JWT_SECRET=your_jwt_secret  # Qálegen qupıya gilt sóz

# Email orqalı OTP jiberiw xızmeti ushın (Gmail mısalında)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password # Gmail App Password (ápiwayı parol emes)
```

---

### 2. Backend'ti iske túsiriw

Terminalda `backend` papkasına ótiń, zárúrli kitapxanalardı ornatıń hám serverdi yoqıń:

```bash
# Backend papkasına ótiw
cd backend

# Kitapxanalardı ornatıw
npm install

# Proyektti islep shıǵıw (development) rejiminde iske túsiriw
npm run dev
```

*Server tabıslı iske túskennen soń, terminalda tómendegi xabarlar payda boladı:*
* `Server 5000-portta juwırıp atır...`
* `Email server tayar (IPv4 arqalı)!`

> [!NOTE]
> Backend birinshi márte iske túskende, ol proyekttegi `database.sql` faylındagı barlıq jadvallardı (`users`, `audit_logs`, `recovery_codes`) avtomatlı túrde bazada jaratadı!

---

### 3. Frontend'ti iske túsiriw

Basqa terminal aynasın ashıp, `frontend` papkasına ótiń hám sayttı yoqıń:

```bash
# Frontend papkasına ótiw
cd frontend

# Kitapxanalardı ornatıw
npm install

# Proyektti iske túsiriw
npm run dev
```

*Frontend ádette `http://localhost:5173` mánzilinde iske túsedi.*

---

## 📁 Proyekt Dúzilisi

```text
Beka/
├── backend/
│   ├── src/
│   │   ├── config/       # Maǵlıwmatlar bazası ulanıwı (db.js)
│   │   ├── controllers/  # Logikalar (auth_controller.js)
│   │   ├── middleware/   # JWT hám qáwipsizlik middleware (authMiddleware.js)
│   │   ├── routes/       # API jolları (authRoutes.js)
│   │   ├── services/     # OTP, MFA hám Email jiberiw xızmetleri
│   │   └── app.js        # Express ilovası konfiguraciyası
│   ├── database.sql      # Bazada jadvallar jaratıw ushın SQL kodlar
│   ├── server.js         # Backend iske túsiriwshi baslanǵısh noqat
│   └── .env              # Ortalıq konfiguraciya faylı
└── frontend/
    ├── src/
    │   ├── api/          # Axios ulanıwı (api/axios.js)
    │   ├── components/   # UI komponentler (ProtectedRoute.jsx)
    │   ├── pages/        # Login, Register, Dashboard, MFA betleri
    │   └── App.jsx       # Basqarıwshı tiykarǵı React komponenti
```
