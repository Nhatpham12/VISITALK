const db = require("../common/connect");

const getReportStats = async (req, res) => {
  try {
    const combinedQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM users WHERE u_status = 'active') AS activeUsers,
        (SELECT COUNT(*) FROM users_sessions) AS totalVisits,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newUsers,
        DATEDIFF(NOW(),(SELECT MIN(created_at) FROM users)) AS daysSinceFirstUser
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
      const totalVisits = data.totalVisits ?? 0;
      const daysSinceFirstUser = data.daysSinceFirstUser ?? 30;

      const dailyQuery = `
        SELECT DATE(login_at) AS date, COUNT(*) AS visits
        FROM users_sessions
        WHERE login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(login_at)
        ORDER BY date
      `;

      db.query(dailyQuery, (err2, dailyResults) => {
        if (err2) {
          console.error("[DAILY VISITS ERROR]:", err2.message);
          return res.status(500).json({ message: "Lỗi truy vấn daily visits" });
        }

        return res.status(200).json({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalVisits: totalVisits,
          avgDailyVisits: Math.round(
            totalVisits / Math.max(1, daysSinceFirstUser),
          ),
          newUsers: data.newUsers || 0,
          dailyVisits: dailyResults || [],
        });
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
