import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Report.css";
import { reportService } from "../services/api";

const Report = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVisits: 0,
    avgDailyVisits: 0,
    newUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/reports/stats");

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu report");
        }

        const data = await reportService.getStats();

        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalVisits: data.totalVisits || 0,
          avgDailyVisits: data.avgDailyVisits || 0,
          newUsers: data.newUsers || 0,
        });
      } catch (err) {
        console.error("REPORT ERROR:", err);
        setError("Lỗi tải dữ liệu từ server");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="main-content">
          <h1>Đang tải dữ liệu...</h1>
        </div>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="main-content">
          <h1>{error}</h1>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="main-content">
        <div className="report-header">
          <h1 className="report-title">THỐNG KÊ, BÁO CÁO</h1>

          <div className="date-range-badge">
            <span>{new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        <div className="stats-grid">
          {/* Tổng lượt truy cập */}
          <div className="stat-card stat-card--dark">
            <p className="stat-label">Tổng lượt truy cập</p>

            <p className="stat-value">{stats.totalVisits} lượt</p>
          </div>

          {/* Trung bình truy cập */}
          <div className="stat-card">
            <p className="stat-label">Trung bình truy cập/ngày</p>

            <p className="stat-value">{stats.avgDailyVisits} lượt</p>
          </div>

          {/* User hoạt động */}
          <div className="stat-card">
            <p className="stat-label">Người dùng hoạt động</p>

            <p className="stat-value">{stats.activeUsers} người</p>
          </div>

          {/* User mới */}
          <div className="stat-card">
            <p className="stat-label">Người dùng mới</p>

            <p className="stat-value">{stats.newUsers} người</p>
          </div>
        </div>

        {/* Section thông tin */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">THÔNG TIN HỆ THỐNG</h2>
          </div>

          <div className="chart-wrapper">
            <div className="report-info">
              <p>
                <strong>Tổng người dùng:</strong> {stats.totalUsers}
              </p>

              <p>
                <strong>Người dùng hoạt động:</strong> {stats.activeUsers}
              </p>

              <p>
                <strong>Tổng lượt truy cập:</strong> {stats.totalVisits}
              </p>

              <p>
                <strong>Người dùng mới:</strong> {stats.newUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Nút export */}
        <div className="action-row">
          <button className="btn-export" onClick={() => window.print()}>
            Xuất PDF
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Report;
