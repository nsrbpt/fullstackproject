const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Auth failed: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; // { userId, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Auth failed: Invalid or expired token" });
  }
};

module.exports = { isAdmin };
