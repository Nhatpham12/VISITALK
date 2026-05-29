const db = require("../common/connect");

const getReportStats = async (req, res) => {
  try {
    const combinedQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM users WHERE u_status = 'active') AS activeUsers,
        (SELECT COUNT(*) FROM access_to) AS totalVisits,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newUsers
    `;

    db.query(combinedQuery, (err, results) => {
      if (err) {
        // Log này sẽ in trực tiếp ra Terminal chạy Node.js để bạn debug
        console.error("[DATABASE ERROR]:", err.message);
        return res.status(500).json({
          message: "Lỗi truy vấn cơ sở dữ liệu: " + err.message,
        });
      }

      // Kiểm tra nếu có kết quả, nếu không gán object rỗng để tránh crash bài toán
      const data = results && results[0] ? results[0] : {};
      const totalVisits = data.totalVisits || 0;

      return res.status(200).json({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalVisits: totalVisits,
        avgDailyVisits: Math.round(totalVisits / 30),
        newUsers: data.newUsers || 0,
      });
    });
  } catch (error) {
    console.error("[SYSTEM ERROR]:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReportStats,
};
