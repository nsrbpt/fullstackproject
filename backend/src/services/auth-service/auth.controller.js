const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminUser = require('../../models/AdminUser');

const login = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const user = await AdminUser.findOne({ adminId });

    if (!user) {
      return res.status(401).json({ message: "Auth failed: Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Auth failed: Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, adminId: user.adminId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Auth successful",
      token,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to authenticate", error: error.message });
  }
};

const register = async (req, res) => {
  // Only for setup purposes to create the initial admin
  try {
    const { adminId, password } = req.body;
    const existing = await AdminUser.findOne({ adminId });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const newUser = new AdminUser({ adminId, passwordHash: hash });
    await newUser.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

module.exports = { login, register };
