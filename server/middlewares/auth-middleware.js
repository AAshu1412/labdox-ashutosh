const jwt = require("jsonwebtoken");
const { User } = require("../models/user-model");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Unauthorized: Token not provided" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    const userData = await User.findOne({ email: decoded.email }).select({
      password: 0,
    });

    if (!userData) {
      return res.status(401).json({ msg: "Unauthorized: User not found" });
    }

    req.user = userData;
    req.token = token;
    req.userID = userData._id;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;