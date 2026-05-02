import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Signup.css";
const Signup = () => {
  return (
    <>
      <div className="Navbar2">
        <div className="img-left">
          <Link to="/">
            <img
              src="../Assets/Images/Arrow.png"
              className="brand"
              alt="Arrow"
            />
          </Link>
          <Link to="/">
            <img
              src="../Assets/Images/Brand.png"
              className="brand"
              alt="Brand"
            />
          </Link>
        </div>
        <div className="img-right">
          <Link to="/setting">
            <img
              src="../Assets/Images/Setting.png"
              className="setting"
              alt="Setting"
            />
          </Link>
        </div>
      </div>
      <div className="form-container">
        <div className="title">
          <h1>CHÀO MỪNG BẠN ĐẾN VỚI</h1>
          <img src="../Assets/Images/Brand.png" className="brand-main" />
        </div>

        <div className="form-group">
          <div className="field">
            <label for="fullname">Họ và tên</label>
            <div className="input-wrapper">
              <input type="text" id="fullname" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label for="DoB">Ngày tháng năm sinh</label>
            <div className="input-wrapper">
              <input type="text" id="DoB" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label for="Email">Email</label>
            <div className="input-wrapper">
              <input type="text" id="Email" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label for="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <input type="text" id="username" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label for="password">Mật khẩu</label>
            <div className="input-wrapper">
              <input type="text" id="password" placeholder="" />
            </div>
          </div>

          <div className="field">
            <label for="pass2">Nhập lại mật khẩu</label>
            <div className="input-wrapper">
              <input type="text" id="pass2" placeholder="" />
            </div>
          </div>
        </div>

        <div className="sign-up-but">
          <button id="sign-up">Đăng ký</button>
        </div>

        <div className="al-account">
          <h5>Bạn đã có tài khoản?</h5>
          <Link to="/login">
            <b>Đăng nhập ngay</b>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
