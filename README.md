# 🤟 VISITALK — Ứng Dụng Dịch Ngôn Ngữ Ký Hiệu Thời Gian Thực

<div align="center">

![VISITALK Banner](./frontend/public/Assets/Images/Brand.png)

**Xóa bỏ rào cản giao tiếp giữa người khiếm thính và cộng đồng**

![JavaScript](https://img.shields.io/badge/JavaScript-71.8%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-26.6%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)

</div>

---

## ✨ Tính Năng Chính

### 🤖 Dịch Ngôn Ngữ Ký Hiệu Thời Gian Thực
- Nhận diện 21 điểm landmark tay qua webcam bằng **MediaPipe HandLandmarker**
- Trích xuất 84 đặc trưng (tọa độ thô + normalized) gửi về backend Python
- **MLPClassifier** dự đoán 29 lớp: chữ A-Z, space, delete, nothing
- Hệ thống ổn định: gesture phải giữ yên **12 frame** liên tiếp trước khi accept
- UI: camera live, confidence arc, progress bar ổn định, top-3 probability chart

### 📚 Hệ Thống Học Tập
- **Bảng chữ cái VSL**: A-Z + 6 dấu thanh Việt (huyền, nặng, ngã, sắc, râu, hỏi)
- **Số đếm**: 0-12, 40, 80, 90, 100, 1K, 5K, 10K, 1 triệu, 1 tỉ
- **Từ thông dụng**: chào, áo, bác sĩ, bạn thân, bệnh viện, chạy... (20+ từ)
- Flashcard: click để xem ảnh + mô tả chi tiết cách thực hiện ký hiệu
- Theo dõi lượt truy cập bài học của từng user

### 👤 Quản Lý Tài Khoản & Phiên
- Đăng ký/đăng nhập JWT (hết hạn 7 ngày), auto-login sau đăng ký
- bcrypt hash mật khẩu, validated username/email/password
- Theo dõi phiên: IP, thiết bị, thời lượng sử dụng
- Tích lũy `total_online_time` trên từng user

### 🔐 Bảo Mật & Rate Limiting
- JWT + session validation trên mỗi request (logout thực sự vô hiệu hóa token)
- Rate limit: login 10/15ph, register 20/giờ, API 500/15ph
- ProtectedRoute + PublicOnlyRoute phân quyền user/admin
- Admin không thể tự ban hoặc xóa chính mình

### 📊 Dashboard Admin
- **Quản lý người dùng**: xem, thêm, sửa, ban/unban, xóa
- **Quản lý bài học**: CRUD bài học ký hiệu
- **Báo cáo thống kê**: tổng user, lượt truy cập, biểu đồ 7 ngày, xuất PDF

### 🏗️ Kiến Trúc Kỹ Thuật
- **Docker multi-stage**: Node.js + Python ML backend | Nginx React frontend | MySQL
- **CI/CD**: GitHub Actions → Build → GHCR → Deploy VPS
- **Nginx**: HTTP→HTTPS, Cloudflare proxy, SPA fallback, static cache (JS/CSS 1yr)
- Connection pool 10 kết nối, timezone +07:00

---

## 🛠️ Công Nghệ

| Layer | Stack |
|-------|-------|
| **Frontend** | React 19 + Vite + React Router v6 |
| **Backend** | Node.js + Express.js + MySQL2 |
| **AI/ML** | MediaPipe HandLandmarker + scikit-learn MLPClassifier |
| **Bảo mật** | JWT (7 ngày) + bcrypt + Rate Limiting + CORS |
| **DevOps** | Docker Compose + GitHub Actions + GHCR + VPS (Nginx) |

---

## 📁 Cấu Trúc Dự Án

```
VISITALK/
├── frontend/              # React + Vite (Port 5173)
│   ├── src/
│   │   ├── pages/         # Translate, Learning, Admin, etc.
│   │   ├── components/    # Navbar, Footer, ProtectedRoute
│   │   ├── services/      # API client (auth, predict, lessons...)
│   │   ├── context/       # AuthContext (global auth state)
│   │   └── CSS/
│   └── public/model/      # ML models (joblib, TensorFlow.js)
├── backend/               # Node.js + Express (Port 5001)
│   ├── routes/            # auth, users, lessons, predict, reports
│   ├── controllers/       # Business logic
│   ├── middleware/        # JWT auth, role guard
│   ├── models/            # MySQL queries
│   ├── predict_server.py  # Python ML inference (stdin/stdout)
│   └── seeders/           # Auto-create admin account
├── .github/workflows/     # CI/CD (ci.yml + cd.yml)
├── docker-compose.yml     # Local dev (MySQL + Backend + Frontend)
├── docker-compose.prod.yml # Production (GHCR images)
├── Dockerfile             # Multi-stage: frontend-build → backend → frontend
├── nginx-docker.conf      # Nginx config inside Docker
├── nginx.conf             # VPS-level Nginx (HTTPS + Cloudflare)
├── init.sql               # Database schema + seed data
└── .env                   # Environment variables (gitignored)
```

---

## 💾 Database Schema

![Database ERD](./erd2.png)

---

## 🚀 Cài Đặt & Chạy

### 1. Clone Repository
```bash
git clone https://github.com/Nhatpham12/VISITALK.git
cd VISITALK
```

### 2. Setup Database (MySQL)
```bash
mysql -u root -p
source "VISITALK DB.txt"
```

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Cấu hình .env với thông tin MySQL, JWT_SECRET, etc.
npm start
# Backend chạy tại http://localhost:5001
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại http://localhost:5173
```

---

## 🌳 Quy Trình Người Dùng

### User
1. **Đăng ký** → `/signup` → auto-login → `/`
2. **Dịch thuật** → `/translate` → bật webcam → thực hiện cử chỉ → nhận text
3. **Học bài** → `/learning` → chọn Alphabet/Numbers/Subjects → xem flashcard
4. **Hồ sơ** → `/personal` → xem/sửa thông tin
5. **Đăng xuất** → lưu thời lượng phiên

### Admin
1. **Đăng nhập** → `/admin` (redirect tự động)
2. **Quản lý user** → ban/unban, thêm, xóa
3. **Quản lý bài học** → `/lessonscontrol` → CRUD lessons
4. **Báo cáo** → `/report` → thống kê, biểu đồ, xuất PDF

---

## 📈 Build & Deploy

### Local Development (Docker)
```bash
docker compose up -d
# Frontend: http://localhost:5173
# Backend:  http://localhost:5001
# MySQL:    localhost:3307
```

### CI/CD Pipeline
- **CI** (`ci.yml`): Push/PR → `main`/`master` → Build Docker images (validate only)
- **CD** (`cd.yml`): CI thành công → Push images lên GHCR → SSH deploy lên VPS
- **VPS**: Nginx reverse proxy → containers (backend:5001, frontend:3080)
- **Domain**: `visitalk.io.vn` (Cloudflare + Let's Encrypt SSL)

---

## 🤝 Đóng Góp

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: Mô tả tính năng"
git push origin feature/your-feature-name
# Tạo Pull Request trên GitHub
```

**Commit Format:**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Tài liệu
- `refactor:` - Cấu trúc lại

---

## 📚 Tài Liệu & Tham Khảo

- [React Docs](https://react.dev)
- [Express.js](https://expressjs.com)
- [MySQL2](https://github.com/sidorares/node-mysql2)
- [MediaPipe](https://mediapipe.dev)

---

## 📞 Liên Hệ

**Tác Giả**: Nhat Pham [@Nhatpham12](https://github.com/Nhatpham12)

- 📧 **Email**: [contact@visitalk.com]
- 💬 **Issues**: [GitHub Issues](https://github.com/Nhatpham12/VISITALK/issues)
- 🌐 **Website**: [visitalk.com]

---

## 📄 License

MIT License © 2024-2026 — Nhat Pham & Contributors

---

<div align="center">

### Made with ❤️ để mở ra những cơ hội giao tiếp mới

![GitHub Stars](https://img.shields.io/github/stars/Nhatpham12/VISITALK?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Nhatpham12/VISITALK?style=social)

</div>
