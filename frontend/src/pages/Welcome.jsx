import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Welcome.css";
const Welcome = () => {
  return (
    <>
      <div className="welcome-page">
        <div className="Navbar">
          <Link to="/">
            <img src="../Assets/Images/Brand.png" className="brand" />
          </Link>
          <Link to="/setting">
            <img src="../Assets/Images/Setting.png" className="setting" />
          </Link>
        </div>
        <div className="content-wrapper">
          <div className="welcome">
            <h1>CHÀO MỪNG BẠN ĐẾN VỚI</h1>
            <img
              src="../Assets/Images/Brand.png"
              alt="VISITALK"
              className="brand-main"
            />
          </div>
          <div className="but">
            <Link to="/login">
              <button id="Login">Đăng nhập</button>
            </Link>
            <Link to="/signup">
              <button id="Sign-up">Đăng ký</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
