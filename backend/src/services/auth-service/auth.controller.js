const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminUser = require('../../models/AdminUser');

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map();

const attemptKey = (req, adminId) => `${req.ip || 'unknown'}:${adminId || 'unknown'}`;

const isLocked = (key) => {
  const data = loginAttempts.get(key);
  if (!data) return false;
  if (Date.now() - data.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return data.count >= MAX_LOGIN_ATTEMPTS;
};

const recordFailedAttempt = (key) => {
  const data = loginAttempts.get(key);
  if (!data || Date.now() - data.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  data.count += 1;
  loginAttempts.set(key, data);
};

const clearAttempt = (key) => {
  loginAttempts.delete(key);
};

const login = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const key = attemptKey(req, adminId);

    if (isLocked(key)) {
      return res.status(429).json({ message: 'Too many failed login attempts. Try again in 15 minutes.' });
    }

    const user = await AdminUser.findOne({ adminId });

    if (!user) {
      recordFailedAttempt(key);
      return res.status(401).json({ message: "Auth failed: Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt(key);
      return res.status(401).json({ message: "Auth failed: Invalid credentials" });
    }

    clearAttempt(key);

    const tokenTtl = '12h';
    const token = jwt.sign(
      { userId: user._id, adminId: user.adminId },
      process.env.JWT_SECRET,
      { expiresIn: tokenTtl }
    );

    res.status(200).json({
      message: "Auth successful",
      token,
      expiresIn: 43200
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to authenticate", error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const setupKey = process.env.ADMIN_SETUP_KEY;
    if (!setupKey) {
      return res.status(403).json({ message: 'Admin registration is disabled on this environment' });
    }

    const incomingSetupKey = req.headers['x-setup-key'];
    if (!incomingSetupKey || incomingSetupKey !== setupKey) {
      return res.status(403).json({ message: 'Invalid setup key for admin registration' });
    }

    const { adminId, password } = req.body;
    if (!adminId || !password || String(password).length < 6) {
      return res.status(400).json({ message: 'adminId and a password of at least 6 chars are required' });
    }

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
