// frontend/src/pages/Setting.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Setting.css";

const Setting = () => {
  const [brightness, setBrightness] = useState(50);
  const [volume, setVolume] = useState(50);
  const [videoQuality, setVideoQuality] = useState("720p");

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="content-wrapper">
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
              <span className="setting-label">Âm lượng</span>
              <div className="slider-wrapper">
                <input
                  type="range"
                  className="setting-slider"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
                <span>{volume}%</span>
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">Chất lượng Video</span>
              <div className="quality-option">
                {["480p", "720p", "1080p"].map((q) => (
                  <button
                    key={q}
                    className={`quality-btn ${videoQuality === q ? "active" : ""}`}
                    onClick={() => setVideoQuality(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="card-footer-icons">
              <img
                src="/Assets/Images/Phone.png"
                className="class-icon"
                alt="Phone"
              />
              <img
                src="/Assets/Images/Chat.png"
                className="class-icon"
                alt="Chat"
              />
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
