import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Termofser.css";

const Termofser = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="Intro">
            <h1>ĐIỀU KHOẢN SỬ DỤNG</h1>
          </div>
          <div className="Para">
            <p id="p1">
              Khi sử dụng dịch vụ VISITALK, bạn đồng ý với các điều khoản sau
              đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng
              ngừng sử dụng dịch vụ ngay lập tức.
            </p>
            <p id="p2">
              <strong>1. Tài khoản người dùng:</strong> Bạn chịu trách nhiệm bảo
              mật thông tin tài khoản và mật khẩu. Mọi hoạt động diễn ra trong
              tài khoản của bạn đều do bạn chịu trách nhiệm.
            </p>
            <p id="p3">
              <strong>2. Sử dụng dịch vụ:</strong> VISITALK cung cấp công cụ dịch
              thuật ngôn ngữ ký hiệu cho mục đích học tập và giao tiếp. Không
              được sử dụng dịch vụ cho các mục đích vi phạm pháp luật.
            </p>
            <p id="p4">
              <strong>3. Nội dung người dùng:</strong> Chúng tôi tôn trọng quyền
              sở hữu trí tuệ của người dùng. Bạn giữ quyền sở hữu đối với mọi
              nội dung bạn tạo ra khi sử dụng dịch vụ.
            </p>
            <p id="p5">
              <strong>4. Giới hạn trách nhiệm:</strong> VISITALK không chịu trách
              nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không
              thể sử dụng dịch vụ, bao gồm nhưng không giới hạn ở thiệt hại do
              dịch thuật sai hoặc mất dữ liệu.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Termofser;
