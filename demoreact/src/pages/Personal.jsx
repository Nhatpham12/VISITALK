import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Personal.css";

const Personal = () => {
  return (
    <>
      <Navbar />

      <div className="main-content">
        <div className="content-wrapper">
          <h1>THÔNG TIN CÁ NHÂN</h1>
          <div className="form-group">
            <div className="field">
              <label htmlFor="fullname">Họ và tên</label>
              <div className="input-wrapper">
                <input type="text" id="fullname" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="DoB">Ngày tháng năm sinh</label>
              <div className="input-wrapper">
                <input type="text" id="DoB" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="sex">Giới tính</label>
              <div className="input-wrapper">
                <input type="text" id="sex" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="Email">Email</label>
              <div className="input-wrapper">
                <input type="text" id="Email" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-wrapper">
                <input type="text" id="username" />
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="avatar"></div>
          <div className="change-del-avt">
            <button id="change-avt">Đổi ảnh đại diện</button>
            <button id="del-avt">Xóa ảnh đại diện</button>
          </div>
          <div className="change-inf">
            <button id="change">Thay đổi thông tin cá nhân</button>
          </div>
          <div className="sign-out">
            <button id="out">Đăng xuất</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Personal;
