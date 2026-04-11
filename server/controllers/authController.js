const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const { databaseReady } = require("../config/db");
const { createUser, findUserByEmail, sanitizeUser } = require("../data/store");

exports.signup = async (req, res) => {
  try {
    const { name = "", email = "", password = "" } = req.body;

    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const hashed = await bcrypt.hash(password, 10);

    let user;
    if (databaseReady()) {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
      });
    } else {
      user = await createUser({
        name,
        email,
        password: hashed,
      });
    }

    return res.status(201).json({
      user: sanitizeUser(user.toObject ? user.toObject() : user),
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    if (error.message === "User already exists") {
      return res.status(409).json({ message: "User already exists." });
    }

    return res.status(500).json({ message: "Unable to sign up right now." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = databaseReady()
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      user: sanitizeUser(user.toObject ? user.toObject() : user),
      token: generateToken(user._id.toString(), user.role),
    });
  } catch {
    return res.status(500).json({ message: "Unable to log in right now." });
  }
};
