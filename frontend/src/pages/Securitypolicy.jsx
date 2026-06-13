import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Securitypolicy.css";

const SecurityPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="Intro">
            <h1>CHÍNH SÁCH BẢO MẬT</h1>
          </div>
          <div className="Para">
            <p id="p1">
              VISITALK cam kết bảo vệ thông tin cá nhân của người dùng. Chúng tôi
              thu thập và xử lý dữ liệu chỉ với mục đích cung cấp dịch vụ dịch
              thuật ngôn ngữ ký hiệu, cải thiện trải nghiệm người dùng và hỗ trợ
              kỹ thuật.
            </p>
            <p id="p2">
              <strong>1. Thông tin thu thập:</strong> Chúng tôi thu thập tên đăng
              nhập, email, ảnh đại diện và lịch sử sử dụng dịch vụ. Dữ liệu hình
              ảnh từ camera chỉ được xử lý trong thời gian thực và không được lưu
              trữ trên máy chủ.
            </p>
            <p id="p3">
              <strong>2. Bảo mật dữ liệu:</strong> Mọi kết nối đến VISITALK đều
              được mã hóa. Chúng tôi không chia sẻ thông tin cá nhân của bạn với
              bên thứ ba mà không có sự đồng ý của bạn, trừ khi có yêu cầu từ
              pháp luật.
            </p>
            <p id="p4">
              <strong>3. Quyền của người dùng:</strong> Bạn có quyền truy cập,
              chỉnh sửa và xóa thông tin cá nhân của mình bất kỳ lúc nào thông
              qua trang cài đặt tài khoản.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecurityPolicy;
