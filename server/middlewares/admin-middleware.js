const adminMiddleware = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access Denied. You are not authorized as admin." });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;