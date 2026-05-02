import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Home.css"; // Đường dẫn tới thư mục CSS của bạn

const Home = () => {
  return (
    <>
      <Navbar />

      <div className="main-content">
        <div className="content-wrapper-home">
          <div className="f1">
            <div className="left">
              <img
                src="/Assets/Images/Brand.png"
                className="Brand1"
                alt="Brand"
              />
              <p>
                Ngôn ngữ ký hiệu hay ngôn ngữ dấu hiệu là loại ngôn ngữ sử dụng
                các chuyển động của bàn tay, cánh tay và cơ thể, cùng với các
                biểu cảm khuôn mặt để truyền đạt thông tin thay vì âm thanh.
              </p>
              <button>Xem thêm</button>
            </div>
            <div className="right">
              <img src="/Assets/Images/Logo.png" alt="Logo" />
            </div>
          </div>

          <div className="f2">
            <h2>CÁC CÂU HỎI THƯỜNG GẶP</h2>
            <div className="ques">
              <p>Mình có thể học NNKH trên website này được không ?</p>
              <p>
                NNKH của Việt Nam có khác với NNKH được sử dụng trên thế giới
                không ?
              </p>
            </div>
          </div>

          <div className="f3">
            <h2>CHÍNH SÁCH BẢO MẬT</h2>
          </div>

          <div className="f4">
            <h2>ĐIỀU KHOẢN SỬ DỤNG</h2>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
