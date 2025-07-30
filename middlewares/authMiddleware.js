const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("Authenticated user:", req.user);

      return next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      // Temporarily allow CORS to show error in browser
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // Token not found
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(401).json({ message: "Not authorized, token not found" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized admin only" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized " });
  }
};

module.exports = {protect,isAdmin};
