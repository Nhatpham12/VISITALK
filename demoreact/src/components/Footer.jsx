import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="foot1">
        <h3>
          HỌC VIỆN CÔNG NGHỆ <br />
          BƯU CHÍNH VIỄN THÔNG
        </h3>
        <div className="in4">
          <p>Địa chỉ: 97 Man Thiện, Hiệp Phú, Thủ Đức, Thành phố Hồ Chí Minh</p>
          <p>Hotline: 0123456789</p>
          <p>Email: kjdnvgkjskhduhskvn@gmail.com</p>
          <p>Facebook: kjdnvgkjskhduhskvn</p>
        </div>
      </div>
      <div className="foot2">
        <h3>HỖ TRỢ</h3>
        <div className="in4">
          <p>
            <Link to="/asking">Giải đáp</Link>
          </p>
          <p>
            <Link to="/">Các câu hỏi thường gặp</Link>
          </p>
          <p>
            <Link to="/securitypolicy">Chính sách bảo mật</Link>
          </p>
          <p>
            <Link to="/termofser">Điều khoản sử dụng</Link>
          </p>
        </div>
      </div>
      <div className="foot3">
        <h3>CHUYÊN MỤC</h3>
        <p>
          <Link to="/translate">Dịch thuật</Link>
        </p>
        <p>
          <Link to="/learning">Từ điển</Link>
        </p>
        <h3>VỀ CHÚNG TÔI</h3>
        <p>
          <Link to="/introduce">Giới thiệu chung</Link>
        </p>
        <img src="/Assets/Images/Brand.png" alt="Brand" />
      </div>
    </div>
  );
};

export default Footer;
