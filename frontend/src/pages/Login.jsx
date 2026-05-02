import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Login.css";

const Login = () => {
  return (
    <>
      <div className="Navbar2">
        <div className="img-left">
          <Link to="/">
            <img src="/Assets/Images/Arrow.png" className="brand" alt="Arrow" />
          </Link>
          <Link to="/">
            <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
          </Link>
        </div>
        <div className="img-right">
          <Link to="/setting">
            <img
              src="/Assets/Images/Setting.png"
              className="setting"
              alt="Setting"
            />
          </Link>
        </div>
      </div>

      <div className="form-container">
        <div className="title">
          <h1>CHÀO MỪNG BẠN ĐẾN VỚI</h1>
          <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
        </div>

        <div className="form-group">
          <div className="field">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <input type="text" id="username" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <input type="text" id="password" placeholder="" />
            </div>
          </div>
        </div>

        <div className="save-password">
          <input type="checkbox" id="save-account" />
          <label htmlFor="save-account">Lưu tài khoản</label>
        </div>

        <div className="login-but">
          <button id="login">Đăng nhập</button>
        </div>

        <div className="no-account">
          <h5>Bạn chưa có tài khoản?</h5>
          <Link to="/signup">
            <b>Đăng ký ngay</b>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
