// frontend/src/pages/Setting.jsx
import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "../CSS/Setting.css";

const Setting = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialBrightness = () => {
    const saved = localStorage.getItem("visitalk_brightness");
    return saved !== null ? Number(saved) : 100;
  };
  const initialSaveChat = () => {
    return localStorage.getItem("visitalk_save_chat") || "Có";
  };

  const [brightness, setBrightness] = useState(initialBrightness);
  const [saveChatHistory, setSaveChatHistory] = useState(initialSaveChat);

  useEffect(() => {
    const value = brightness / 100;
    document.documentElement.style.filter = `brightness(${value})`;
    localStorage.setItem("visitalk_brightness", brightness);
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem("visitalk_save_chat", saveChatHistory);
  }, [saveChatHistory]);

  return (
    <>
      <Navbar />
      <div className="main-content-setting">
        <div className="content-wrapper-setting">
          <div className="Intro">
            <h1>CÀI ĐẶT</h1>
          </div>

          <div className="settings-list">
            <div className="setting-row">
              <span className="setting-label">Độ sáng màn hình</span>
              <div className="slider-wrapper">
                <input
                  type="range"
                  className="setting-slider"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                />
                <span>{brightness}%</span>
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">Lưu lịch sử hội thoại</span>
              <div className="yn-option">
                {["Có", "Không"].map((q) => (
                  <button
                    key={q}
                    className={`yn-btn ${saveChatHistory === q ? "active" : ""}`}
                    onClick={() => setSaveChatHistory(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="signout-row">
              <button
                className="signout-btn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>

          <div className="card-footer">
            <div className="card-footer-icons">
              <Link to="/admin">
                <img
                  src="/Assets/Images/Personal.png"
                  className="card-icon"
                  alt="Admin"
                />
              </Link>
              <div className="card-footer-report">
                <Link to="/report">
                  <img
                    src="/Assets/Images/btn_background.png"
                    className="report-bg"
                    alt=""
                  />
                  <img
                    src="/Assets/Images/Report.png"
                    className="report-btn"
                    alt="Report"
                  />
                </Link>
              </div>
            </div>
            <div className="card-footer-logo">
              <img
                src="/Assets/Images/Brand.png"
                className="card-footer-brand"
                alt="VISITALK"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Setting;
