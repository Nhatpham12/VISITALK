// Middleware kiểm tra role — dùng SAU verifyToken
// Ví dụ: router.delete('/:id', verifyToken, requireRole('admin'), userController.delete)

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực" });
    }

    if (!roles.includes(req.user.u_role)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }

    next();
  };
};

module.exports = { requireRole };
