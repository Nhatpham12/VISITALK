import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Report.css";

const Report = () => {
  return (
    <>
      <Navbar />

      <div className="main-content">
        <div className="report-header">
          <h1 className="report-title">THỐNG KÊ, BÁO CÁO</h1>
          <div className="date-range-badge">
            <span id="date-range-text">1/1/2026 - 30/6/2026</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card--dark">
            <p className="stat-label">Tổng lượt truy cập</p>
            <p className="stat-value" id="total-visits">
              267 lượt
            </p>
            <p className="stat-trend">
              ↗ <span id="trend-total">xx % so với tháng trước</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Trung bình lượng truy cập hàng ngày</p>
            <p className="stat-value" id="avg-daily">
              10 lượt
            </p>
            <p className="stat-trend">
              ↗ <span id="trend-avg">xx % so với tháng trước</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Người dùng đang hoạt động</p>
            <p className="stat-value" id="active-users">
              200 người
            </p>
            <p className="stat-trend">
              ↗ <span id="trend-active">xx % so với tháng trước</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Người dùng mới</p>
            <p className="stat-value" id="new-users">
              38 người
            </p>
            <p className="stat-trend">
              ↗ <span id="trend-new">xx % so với tháng trước</span>
            </p>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">TỔNG LƯỢT TRUY CẬP</h2>
            <button className="chart-expand-btn" title="Phóng to">
              <img src="../Assets/Images/Zoom-in.png" className="expand-icon" />
            </button>
          </div>
          <div className="chart-wrapper">
            <canvas id="visitChart"></canvas>
          </div>
        </div>

        <div className="action-row">
          <button className="btn-export" onClick={() => window.print()}>
            Xuất file PDF
          </button>
          <button className="btn-chat" title="Chat hỗ trợ">
            <img src="../Assets/Images/Chat.png" className="chat" />
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Report;
