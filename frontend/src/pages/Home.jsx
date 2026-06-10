import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Home.css"; // Đường dẫn tới thư mục CSS của bạn

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="home-page">
        <div className="main-content">
          <div className="content-wrapper">
            <div className="f1">
              <div className="left">
                <img
                  src="/Assets/Images/Brand.png"
                  className="Brand1"
                  alt="Brand"
                />
                <p>
                  Ngôn ngữ ký hiệu hay ngôn ngữ dấu hiệu là loại ngôn ngữ sử
                  dụng các chuyển động của bàn tay, cánh tay và cơ thể, cùng với
                  các biểu cảm khuôn mặt để truyền đạt thông tin thay vì âm
                  thanh.
                </p>
                <button>Xem thêm</button>
              </div>
              <div className="right">
                <img src="/Assets/Images/Logo.png" alt="Logo" />
              </div>
            </div>

            <div className="f2">
              <div className="community-header">
                <p1>CỘNG ĐỒNG VISITALK</p1>
                <h2>Tầm nhìn và sứ mệnh</h2>
                <p2>
                  Tiên phong số hóa ngôn ngữ ký hiệu, xóa bỏ rào cản giao tiếp
                  và nâng tầm cuộc sống người khiếm thính.
                </p2>
              </div>
              <div className="community-right-panel">
                <div className="card1">
                  <img
                    src="/Assets/Images/Personal.png"
                    className="png1"
                    alt=""
                  />
                  <h1>2.500+</h1>
                  <p1>Người dùng tin tưởng</p1>
                </div>
                <div className="card2">
                  <img src="/Assets/Images/Book.png" className="png2" alt="" />
                  <h2>2.000+</h2>
                  <p2>Từ vựng thông dụng</p2>
                </div>
                <div className="card3">
                  <img src="/Assets/Images/Chat.png" className="png3" alt="" />
                  <h3>150+</h3>
                  <p3>Câu chuyện được chia sẻ</p3>
                </div>
              </div>

              <div className="community-content">
                <div className="left-panel">
                  <img
                    src="/Assets/Images/Lock.png"
                    className="left-icon"
                    alt=""
                  />
                  <h1>KIẾN TẠO XÃ HỘI KHÔNG RÀO CẢN</h1>
                  <p>
                    Trở thành nền tảng công nghệ hỗ trợ ngôn ngữ ký hiệu tiên
                    phong, giúp người khiếm thính tự do kết nối và phát triển
                    toàn diện.
                  </p>
                </div>
                <div className="right-panel">
                  <img
                    src="/Assets/Images/Share.png"
                    className="right-icon"
                    alt=""
                  />
                  <h2>TRAO QUYỀN VÀ LAN TỎA NHÂN VĂN</h2>
                  <p>
                    Đơn giản hóa việc học ngôn ngữ ký hiệu bằng giải pháp số
                    chuẩn xác, đưa tiếng nói của cộng đồng yếu thế đến gần hơn
                    với xã hội.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
