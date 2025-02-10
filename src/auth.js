const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mysecretkey"; // Use environment variables in production

// 🔹 Hash the user password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// 🔹 Compare password with stored hash
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// 🔹 Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
};

// 🔹 Middleware to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error("Invalid or Expired Token");
  }
};

module.exports = { hashPassword, verifyPassword, generateToken, verifyToken };
