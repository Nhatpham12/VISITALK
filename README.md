# 🤟 VISITALK — Ứng Dụng Dịch Ngôn Ngữ Ký Hiệu Thời Gian Thực

<div align="center">

![VISITALK Banner](./frontend/public/Assets/Images/Brand.png)

**Xóa bỏ rào cản giao tiếp giữa người khiếm thính và cộng đồng**

![JavaScript](https://img.shields.io/badge/JavaScript-72.9%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-24%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![Python](https://img.shields.io/badge/Python-2.9%25-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)

</div>

---

## 📖 Giới Thiệu

**VISITALK** là một nền tảng web toàn diện kết hợp **nhận diện ngôn ngữ ký hiệu thời gian thực**, **quản lý người dùng**, và **hệ thống học tập tương tác**. Ứng dụng cung cấp:

✅ **Dịch thuật thời gian thực** — Nhận diện cử chỉ tay qua webcam  
✅ **Quản lý tài khoản đầy đủ** — Xác thực, hồ sơ, lịch sử phiên làm việc  
✅ **Hệ thống học tập** — Khóa học về chào hỏi, bảng chữ cái, số đếm  
✅ **Dashboard Admin** — Quản lý người dùng, bài học, báo cáo  
✅ **Giao diện responsive** — Tối ưu cho desktop, tablet, điện thoại  

---

## ✨ Tính Năng Chính

### 🎯 Dịch Thuật & Nhận Diện
- Nhận diện cử chỉ tay qua webcam thường
- Dịch thuật thời gian thực sang văn bản
- Hỗ trợ ngôn ngữ ký hiệu Việt Nam

### 👤 Quản Lý Tài Khoản
- **Đăng ký/Đăng nhập** với xác thực an toàn (bcrypt, JWT)
- **Hồ sơ cá nhân** — Cập nhật thông tin, avatar
- **Lịch sử phiên** — Theo dõi hoạt động, thời gian trực tuyến
- **Bảo mật** — Rate limiting, HTTPS-ready, token JWT

### 📚 Hệ Thống Học Tập
- **Khóa học có cấu trúc** — Greeting, Alphabet, Numbers
- **Theo dõi tiến độ** — Ghi nhận khoá học đã truy cập
- **Giao diện tương tác** — Hình ảnh, ý nghĩa, nội dung chi tiết

### 🛡️ Quyền Hạn & Bảo Mật
- **Phân quyền** — User vs Admin
- **Protected Routes** — Đăng nhập bắt buộc cho tính năng nhạy cảm
- **Rate Limiting** — Chống brute-force, DDoS
- **CORS & Helmet** — Bảo vệ header HTTP

### ⚙️ Dashboard Admin
- Quản lý toàn bộ người dùng
- Thêm/sửa/xóa bài học
- Xem báo cáo hoạt động
- Quản lý phiên làm việc

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────┐
│   Frontend (React 19 + Vite)        │
│  ├─ Pages (Home, Login, Translate)  │
│  ├─ Components (Navbar, Footer)     │
│  ├─ Context (Auth State)            │
│  ├─ Services (API Client)           │
│  └─ CSS (Responsive Design)         │
└──────────────┬──────────────────────┘
               │ HTTP/HTTPS + JWT
┌──────────────┴───────────────────────┐
│   Backend (Node.js + Express)        │
│  ├─ Routes (Auth, Users, Lessons)    │
│  ├─ Controllers (Business Logic)     │
│  ├─ Middleware (Auth, Rate Limit)    │
│  ├─ Models (Database Schema)         │
│  └─ Common (Utilities)               │
└──────────────┬───────────────────────┘
               │ SQL Query
               ↓
        ┌──────────────────┐
        │   MySQL Database │
        │  ├─ users        │
        │  ├─ lessons      │
        │  ├─ access_to    │
        │  └─ sessions     │
        └──────────────────┘
```

---

## 📁 Cấu Trúc Dự Án Chi Tiết

```
VISITALK/
├── 📂 frontend/                           # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx                        # Main routing component
│   │   ├── main.jsx                       # Vite entry point
│   │   ├── CSS/                           # Global styles
│   │   │   └── index.css
│   │   ├── components/                    # Reusable React components
│   │   │   ├── Navbar.jsx                 # Navigation header
│   │   │   ├── Navbar.css
│   │   │   ├── Footer.jsx                 # Footer component
│   │   │   ├── Footer.css
│   │   │   ├── ProtectedRoute.jsx         # Auth guard for routes
│   │   │   └── ...
│   │   ├── pages/                         # Page components (React Router)
│   │   │   ├── Home.jsx                   # Trang chủ
│   │   │   ├── Login.jsx                  # Đăng nhập
│   │   │   ├── Signup.jsx                 # Đăng ký
│   │   │   ├── Welcome.jsx                # Trang chào mừng
│   │   │   ├── Translate.jsx              # 🎯 Chính: Dịch thuật thời gian thực
│   │   │   ├── Learning.jsx               # Trung tâm học tập
│   │   │   ├── Greeting.jsx               # Khóa: Chào hỏi
│   │   │   ├── Alphabet.jsx               # Khóa: Bảng chữ cái
│   │   │   ├── Numbers.jsx                # Khóa: Số đếm
│   │   │   ├── Personal.jsx               # Hồ sơ cá nhân
│   │   │   ├── Setting.jsx                # Cài đặt
│   │   │   ├── Admin.jsx                  # Dashboard admin
│   │   │   ├── Asking.jsx                 # Hỗ trợ/Liên hệ
│   │   │   ├── Report.jsx                 # Báo cáo
│   │   │   ├── Introduce.jsx              # Giới thiệu dự án
│   │   │   ├── Securitypolicy.jsx         # Chính sách bảo mật
│   │   │   └── Termofser.jsx              # Điều khoản dịch vụ
│   │   ├── context/                       # React Context (State management)
│   │   │   └── AuthContext.jsx            # Quản lý trạng thái xác thực
│   │   ├── services/                      # API client
│   │   │   └── api.js                     # Axios instance + API methods
│   │   └── ...
│   ├── public/
│   │   ├── Assets/                        # Hình ảnh, tài nguyên tĩnh
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── index.html                     # HTML entry point
│   ├── vite.config.js                     # Vite config
│   ├── eslint.config.js                   # ESLint config
│   ├── package.json
│   └── README.md
│
├── 📂 backend/                            # Node.js + Express Backend
│   ├── routes/                            # API route handlers
│   │   ├── auth.routes.js                 # /api/auth — Login/Signup
│   │   ├── users.routes.js                # /api/users — User CRUD
│   │   ├── lessons.routes.js              # /api/lessons — Lesson management
│   │   └── userSessions.routes.js         # /api/user-sessions — Session tracking
│   ├── controllers/                       # Business logic
│   │   ├── auth.controllers.js            # Login, Signup, Token refresh
│   │   ├── user.controllers.js            # Get profile, Update profile
│   │   ├── lessons.controllers.js         # Get lessons, Create lesson
│   │   ├── accessTo.controllers.js        # Lesson access tracking
│   │   └── session.controllers.js         # Session management
│   ├── middleware/                        # Express middleware
│   │   ├── auth.middleware.js             # JWT verification
│   │   ├── roleCheck.middleware.js        # Admin role check
│   │   └── errorHandler.js                # Error handling
│   ├── models/                            # Database models/helpers
│   │   ├── User.js
│   │   ├── Lesson.js
│   │   └── Database.js
│   ├── common/                            # Utility functions
│   │   ├── database.js                    # MySQL connection
│   │   ├── constants.js                   # Constants, error codes
│   │   └── validators.js                  # Input validation
│   ├── index.js                           # Server entry point
│   ├── package.json
│   └── .env.example                       # Environment variables example
│
├── 📄 README.md                           # This file (Vietnamese)
├── 📄 VISITALK DB.txt                     # Database schema SQL
├── requirements.txt                       # Python dependencies (legacy)
├── .gitignore
└── ...

```

---

## 🛠️ Công Nghệ Stack

### Frontend Stack
| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|----------|---------|
| **React** | 19.2.5 | UI Framework, Component-based |
| **Vite** | 8.0+ | Build tool, Fast dev server |
| **React Router** | 7.14+ | Client-side routing |
| **Axios** | Latest | HTTP client for API calls |
| **CSS3** | - | Styling, Responsive design |
| **JavaScript (ES6+)** | - | Language |

### Backend Stack
| Công Nghệ | Mục Đích |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework, Routing |
| **MySQL2** | Database driver |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcrypt** | Password hashing |
| **CORS** | Cross-origin requests |
| **Helmet** | HTTP header security |
| **Express Rate Limit** | DDoS protection |
| **dotenv** | Environment variables |

### Database (MySQL)
```sql
-- Bảng người dùng
users (id, username, full_name, password_hash, role, email, created_at, avatar_url, total_online_time)

-- Bảng bài học
lessons (les_id, title, img_url, content, meaning)

-- Theo dõi truy cập bài học
access_to (users_id, les_id, accessed_at)

-- Quản lý phiên đăng nhập
users_sessions (sessions_id, users_id, login_at, logout_at, duration, ip_address, device)
```

### Dependencies Chính

**Frontend:**
```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.2"
}
```

**Backend:**
```json
{
  "express": "^5.2.1",
  "mysql2": "^3.22.2",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.3",
  "cors": "^2.8.6",
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.4.0"
}
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu Cầu
- **Node.js** 16+ với **npm** hoặc **yarn**
- **MySQL** 5.7+ (hoặc MariaDB)
- **Webcam** (cho tính năng dịch thuật)
- **Trình duyệt hiện đại**: Chrome, Edge, Firefox

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Nhatpham12/VISITALK.git
cd VISITALK
```

### 2️⃣ Setup Database (MySQL)

```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy SQL schema từ file VISITALK DB.txt
source "VISITALK DB.txt"

# Hoặc tạo database thủ công:
CREATE DATABASE visitalk_db;
USE visitalk_db;
# ... (copy nội dung từ VISITALK DB.txt)
```

### 3️⃣ Setup Backend (Node.js + Express)

```bash
cd backend

# Cài dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cấu hình .env với thông tin MySQL
# PORT=5001
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=visitalk_db
# JWT_SECRET=your_secret_key

# Chạy server
npm start
# hoặc dev mode: npm run dev
```

Backend chạy tại: **http://localhost:5001**

### 4️⃣ Setup Frontend (React + Vite)

```bash
cd frontend

# Cài dependencies
npm install

# Chạy development server
npm run dev

# Hoặc build production
npm run build
```

Frontend chạy tại: **http://localhost:5173**

### 5️⃣ Kiểm Tra Kết Nối

```bash
# Test API health check
curl http://localhost:5001/api/health

# Kết quả dự kiến:
# {"status":"ok","timestamp":"2026-05-20T14:52:35Z"}
```

---

## 🔐 Cấu Hình Bảo Mật

### .env Backend Example
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=visitalk_db
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### CORS Configuration
Frontend được phép gọi từ:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (React CRA)
- `http://localhost:5500` (Live Server)

### Rate Limiting
- **Global**: 200 requests / 15 phút
- **Auth**: 10 requests / 5 phút (chống brute-force)

---

## 📊 API Endpoints

### Authentication (`/api/auth`)
```http
POST   /api/auth/register       # Đăng ký tài khoản mới
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/logout         # Đăng xuất
POST   /api/auth/refresh        # Làm mới token JWT
```

### Users (`/api/users`)
```http
GET    /api/users/:id           # Lấy thông tin user
PUT    /api/users/:id           # Cập nhật profile
GET    /api/users               # Danh sách users (admin only)
DELETE /api/users/:id           # Xóa user (admin only)
```

### Lessons (`/api/lessons`)
```http
GET    /api/lessons             # Lấy tất cả bài học
GET    /api/lessons/:id         # Chi tiết bài học
POST   /api/lessons             # Tạo bài học mới (admin only)
PUT    /api/lessons/:id         # Cập nhật bài học (admin only)
DELETE /api/lessons/:id         # Xóa bài học (admin only)
```

### User Sessions (`/api/user-sessions`)
```http
POST   /api/user-sessions       # Bắt đầu phiên mới
PUT    /api/user-sessions/:id   # Kết thúc phiên
GET    /api/user-sessions/:uid  # Lịch sử phiên của user
```

---

## 🎯 Flow Chính của Ứng Dụng

### 1. **Trang Chủ & Giới Thiệu** (Công khai)
- Hiển thị giới thiệu VISITALK
- Link đến Chính sách bảo mật, Điều khoản dịch vụ
- Nút đăng nhập/đăng ký

### 2. **Xác Thực** (Chưa đăng nhập)
```
Signup → Tạo tài khoản mới
  ↓
Validation (bcrypt hash mật khẩu)
  ↓
Login → Xác minh email + mật khẩu
  ↓
JWT Token → Lưu localStorage
  ↓
Redirect → Home hoặc Translate
```

### 3. **Dịch Thuật (Chính)** (Đã đăng nhập)
```
/translate
  ↓
Webcam Access → getUserMedia()
  ↓
Hand Detection → MediaPipe (Python/JS)
  ↓
Gesture Recognition → AI Model
  ↓
Text Output → Hiển thị & Lưu DB
  ↓
Access Tracking → Ghi nhận trong access_to table
```

### 4. **Học Tập**
```
/learning
  ├─ /learning/greeting → Khóa chào hỏi
  ├─ /learning/alphabet → Khóa bảng chữ cái
  └─ /learning/numbers → Khóa số đếm
```

### 5. **Hồ Sơ & Cài Đặt** (Đã đăng nhập)
```
/personal → Xem & Chỉnh sửa thông tin
/setting → Thay đổi mật khẩu, Cài đặt
```

### 6. **Admin Panel** (Chỉ admin)
```
/admin
  ├─ Quản lý Users
  ├─ Quản lý Lessons
  └─ Xem Analytics & Reports
```

---

## 🌳 Component Structure (Frontend)

```
App (Router)
├── Home (Public)
├── Layout
│   ├── Navbar
│   └── Footer
├── Auth Pages
│   ├── Login
│   ├── Signup
│   └── Welcome
├── Protected Pages
│   ├── Translate (Main feature)
│   ├── Learning
│   │   ├── Greeting
│   │   ├── Alphabet
│   │   └── Numbers
│   ├── Personal
│   ├── Setting
│   ├── Asking
│   └── Report
├── Admin Pages
│   └── Admin Dashboard
└── Info Pages
    ├── Introduce
    ├── Securitypolicy
    └── Termofser
```

---

## 🔒 Quy Trình Xác Thực

### Register
```javascript
{
  username: "john_doe",
  full_name: "John Doe",
  email: "john@example.com",
  password: "securePassword123"
}
↓
Validate (email format, password strength)
↓
Hash password (bcrypt rounds: 10)
↓
Save to users table
↓
Return success message
```

### Login
```javascript
{
  email: "john@example.com",
  password: "securePassword123"
}
↓
Find user by email
↓
Compare password (bcrypt verify)
↓
Generate JWT token
↓
Create session record
↓
Return token + user info
```

### Protected Routes
```javascript
GET /api/protected
Header: Authorization: Bearer <JWT_TOKEN>
↓
Verify JWT signature
↓
Check token expiration
↓
Extract user ID
↓
Allow/Deny request
```

---

## 📈 Build & Deploy

### Build Production Frontend

```bash
cd frontend

npm run build
# Output: dist/ folder (optimized, minified)

# Preview locally
npm run preview
```

### Deploy Frontend

**Vercel (Khuyến khích)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Traditional Hosting (CPanel, etc)**
```bash
# Upload dist/ folder nội dung đến public_html
scp -r dist/* user@host:/var/www/html/
```

### Deploy Backend

**Option 1: Heroku**
```bash
heroku login
heroku create visitalk-backend
git push heroku main
```

**Option 2: Railway / Render**
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push

**Option 3: VPS / Server Riêng**
```bash
ssh user@your_server_ip
git clone <repo>
cd VISITALK/backend
npm install
npm start
# Hoặc dùng PM2 cho production:
pm2 start index.js --name "visitalk-backend"
pm2 save
```

---

## 📚 Hướng Dẫn Sử Dụng

### Cho Người Dùng Thường

1. **Truy cập trang chủ** → `/`
2. **Đăng ký tài khoản** → `/signup`
3. **Đăng nhập** → `/login`
4. **Sử dụng dịch thuật** → `/translate` (bật webcam, thực hiện cử chỉ)
5. **Học bài học** → `/learning` → Chọn khóa học
6. **Quản lý hồ sơ** → `/personal`

### Cho Admin

1. Đăng nhập với tài khoản admin
2. Truy cập `/admin`
3. Quản lý người dùng, bài học, xem báo cáo

---

## 🐛 Troubleshooting

### Webcam không hoạt động
```bash
# Kiểm tra quyền
# Chrome: Settings → Privacy → Site Settings → Camera
# Firefox: about:preferences → Privacy → Permissions → Camera

# Xóa cache & reload
Ctrl+Shift+R (hoặc Cmd+Shift+R trên Mac)
```

### Lỗi "CORS: origin không được phép"
```javascript
// Kiểm tra trong backend/index.js
// Đảm bảo frontend URL được thêm vào allowedOrigins

const allowedOrigins = [
  "http://localhost:5173",  // Frontend dev
  "http://localhost:3000",  // Alternative dev
  "https://yourdomain.com"  // Production
];
```

### MySQL Connection Error
```bash
# Kiểm tra MySQL running
sudo systemctl status mysql  # Linux
brew services list         # macOS
net start mysql80          # Windows

# Kiểm tra .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=visitalk_db
```

### JWT Token Expired
```javascript
// Frontend tự động refresh token hoặc
// Yêu cầu user login lại
```

---

## 📞 Hỗ Trợ & Liên Hệ

**Tác Giả**: Nhat Pham [@Nhatpham12](https://github.com/Nhatpham12)

- 📧 **Email**: [contact@visitalk.com]
- 💬 **Issues**: [GitHub Issues](https://github.com/Nhatpham12/VISITALK/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/Nhatpham12/VISITALK/discussions)
- 🌐 **Website**: [visitalk.com]

---

## 📄 License

MIT License © 2024-2026 — Nhat Pham & Contributors

---

## 🎯 Lộ Trình Phát Triển (Roadmap)

- [x] Cấu trúc backend (Express + Routes + Controllers)
- [x] Database schema (Users, Lessons, Sessions)
- [x] Authentication (Login/Signup/JWT)
- [x] Frontend routing (React Router)
- [x] User management (Profile, Settings)
- [x] Lesson management system
- [x] Admin dashboard (basics)
- [ ] **Tích hợp AI nhận diện cử chỉ tay (Priority)**
- [ ] Real-time webcam translation
- [ ] Dataset bảng chữ cái Tiếng Ký Hiệu Việt Nam
- [ ] Tối ưu performance (caching, lazy loading)
- [ ] Progressive Web App (PWA)
- [ ] Offline mode support
- [ ] Video streaming (WebRTC)
- [ ] Analytics & Reports dashboard
- [ ] Multi-language support

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng theo quy trình:

### 1. Fork Repository
```bash
# Nhấp "Fork" trên GitHub hoặc:
gh repo fork Nhatpham12/VISITALK --clone
```

### 2. Tạo Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Commit Thay Đổi
```bash
git commit -m "feat: Thêm [tính năng cụ thể]"
```

**Commit Message Format:**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Tài liệu
- `style:` - Formatting
- `refactor:` - Cấu trúc lại
- `test:` - Unit test

### 4. Push & Create Pull Request
```bash
git push origin feature/your-feature-name
# Tạo PR trên GitHub
```

---

## 📖 Tài Liệu & Tham Khảo

### Frontend Documentation
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

### Backend Documentation
- [Express.js](https://expressjs.com)
- [MySQL2/Promise](https://github.com/sidorares/node-mysql2)
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

### Additional Resources
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [REST API Best Practices](https://restfulapi.net)
- [SQL Tutorial](https://www.w3schools.com/sql)

---

## 🎉 Cảm Ơn

**VISITALK** được xây dựng với tình yêu để phục vụ cộng đồng người khiếm thính Việt Nam.

Nếu thấy hữu ích, vui lòng **⭐ Star** repository này!

<div align="center">

### Made with ❤️ để mở ra những cơ hội giao tiếp mới

![GitHub Stars](https://img.shields.io/github/stars/Nhatpham12/VISITALK?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Nhatpham12/VISITALK?style=social)

</div>
