# 🤟 VISITALK — Ứng Dụng Dịch Ngôn Ngữ Ký Hiệu Thời Gian Thực

<div align="center">

![VISITALK Banner](../VISITALK/frontend/Assets/Images/Brand.png)

**Xóa bỏ rào cản giao tiếp giữa người khiếm thính và cộng đồng**

![HTML](https://img.shields.io/badge/HTML-51.3%25-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-35.9%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-12.8%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Computer%20Vision-0097A7?style=flat-square&logo=google&logoColor=white)
![NodeJs](https://img.shields.io/badge/NodeJs-Backend-3776AB?style=flat-square&logo=python&logoColor=white)

</div>

---

## 📖 Giới Thiệu

**VISITALK** là một WebApp nhận diện và dịch ngôn ngữ ký hiệu theo thời gian thực, hoạt động như một **"phiên dịch viên ảo 24/7"** — không cần cài đặt, không cần thiết bị đặc biệt, chỉ cần camera thông thường trên laptop hoặc điện thoại.

Dự án được xây dựng nhằm giải quyết ba vấn đề cốt lõi:

| Vấn đề                                                      | Giải pháp của VISITALK              |
| ----------------------------------------------------------- | ----------------------------------- |
|  Rào cản giao tiếp giữa người khiếm thính và người nghe nói | Dịch thuật tức thì qua camera       |
|  Chi phí thuê phiên dịch viên ngôn ngữ ký hiệu cao          | Phiên dịch viên AI miễn phí 24/7    |
|  Giao tiếp qua giấy bút mất đi tính tự nhiên                | Hội thoại trực tiếp, thời gian thực |

---

##  Tính Năng

-  **Nhận diện tay thời gian thực** — Phát hiện 21 điểm khớp tay qua webcam thông thường
-  **Xử lý tốc độ cao** — Hiển thị FPS, không có độ trễ đáng kể
-  **Không cần cài đặt** — Chạy trực tiếp trên trình duyệt
-  **Đa nền tảng** — Hỗ trợ laptop, máy tính bảng, điện thoại
-  **Dịch thuật sang văn bản** — Chuyển cử chỉ tay thành chữ viết

---

##  Kiến Trúc Hệ Thống

```
 Webcam Input
       ↓
 MediaPipe (Nhận diện 21 keypoints trên bàn tay)
       ↓
 Phân tích cấu trúc ngón tay (co / duỗi)
       ↓
 AI / ML Classifier (Nhận diện ký hiệu)
       ↓
 Text Output / 🔊 Speech Output
```

---

## 📁 Cấu Trúc Dự Án

```
VISITALK/
├── 📂 Images/          # Tài nguyên hình ảnh
├── 📂 Pages/           # Các trang giao diện WebApp
│   ├── index.html      # Trang chủ
│   ├── camera.html     # Trang nhận diện ký hiệu
│   └── about.html      # Giới thiệu dự án
├── 📄 README.md
└── ...
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend

- **HTML5** — Cấu trúc giao diện
- **CSS3** — Styling và responsive design
- **JavaScript** — Tương tác người dùng và kết nối WebAPI

### Computer Vision & AI

- **MediaPipe Hands** — Nhận diện và theo dõi bàn tay (21 landmarks)
- **Python** — Xử lý backend và logic nhận diện
- **Machine Learning** — Phân loại ký hiệu tay

### Các Module Python

| Module                  | Chức năng                                             |
| ----------------------- | ----------------------------------------------------- |
| `HandTrackingModule.py` | "Đôi mắt" của hệ thống — phát hiện bàn tay qua webcam |
| `SeperatelyTracking.py` | Phân tích trạng thái từng ngón tay (co / duỗi)        |
| `volumeHandControl.py`  | Demo tương tác: cử chỉ tay → hành động máy tính       |

---

## Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu

- Python 3.8+
- Webcam
- Trình duyệt hiện đại (Chrome, Edge, Firefox)

### Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### Chạy ứng dụng

```bash
# Clone repository
git clone https://github.com/Nhatpham12/VISITALK.git
cd VISITALK

# chạy backend
cd backend -> node index.js
# Chạy module nhận diện tay
python HandTrackingModule.py
```

Hoặc mở file `Pages/index.html` trực tiếp trên trình duyệt để trải nghiệm giao diện WebApp.

---

## 🗺️ Lộ Trình Phát Triển

- [x] Module nhận diện bàn tay (MediaPipe)
- [x] Phân tích trạng thái ngón tay
- [x] Demo tương tác cử chỉ tay
- [x] Giao diện WebApp cơ bản
- [x] File DataCollector để thu thập dataset ngôn ngữ ký hiệu
- [ ] Bộ dataset bảng chữ cái ngôn ngữ ký hiệu Việt Nam
- [ ] Chuyển đổi sang TensorFlow.js (chạy hoàn toàn trên trình duyệt)
- [ ] Deploy lên cloud

---

## 💡 Bối Cảnh & Động Lực

Dự án được hình thành từ sự giao thoa giữa **nhu cầu xã hội cấp thiết** và **sự chín muồi của công nghệ**:

> _Tại Việt Nam, hàng triệu người khiếm thính đang phải đối mặt với rào cản giao tiếp hằng ngày — khi đi mua sắm, khám bệnh, hay đơn giản là hỏi đường. VISITALK ra đời để là chiếc cầu nối đó._

Nhờ sự phổ biến của **Computer Vision** (MediaPipe) và khả năng xử lý **thời gian thực** ngay trên trình duyệt, nay có thể xây dựng một phiên dịch viên ngôn ngữ ký hiệu **miễn phí, không cần cài đặt, hoạt động 24/7**.

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Nếu bạn muốn cải thiện dự án:

1. Fork repository này
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "Thêm tính năng XYZ"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📬 Liên Hệ

**Nhat Pham** — [@Nhatpham12](https://github.com/Nhatpham12)

---

<div align="center">

Made with ❤️ để phục vụ cộng đồng người khiếm thính Việt Nam

</div>
