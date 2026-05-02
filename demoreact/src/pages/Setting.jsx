import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Setting.css";

const Setting = () => {
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
                <span className="slide-dot"></span>
                <input
                  type="range"
                  className="setting-slider"
                  id="brightness-slider"
                  min="0"
                  max="100"
                  value="50"
                />
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">Âm lượng</span>
              <div className="slider-wrapper">
                <span className="slide-dot"></span>
                <input
                  type="range"
                  className="setting-slider"
                  id="volume-slider"
                  min="0"
                  max="100"
                  value="50"
                />
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">Chất lượng Video</span>
              <div className="quality-option">
                <button
                  className="quality-btn"
                  onClick={() => setVideoQuality("480p")}
                >
                  480p
                </button>
                <button
                  className="quality-btn"
                  onClick={() => setVideoQuality("720p")}
                >
                  720p
                </button>
                <button
                  className="quality-btn"
                  onClick={() => setVideoQuality("1080p")}
                >
                  1080p
                </button>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="card-footer-icons">
              <img
                src="../Assets/Images/Phone.png"
                className="class-icon"
                alt="Phone"
              />
              <img
                src="../Assets/Images/Chat.png"
                className="class-icon"
                alt="Chat"
              />
            </div>
            <div className="card-footer-logo">
              <img
                src="../Assets/Images/Brand.png"
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
