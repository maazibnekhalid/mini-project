const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { databaseReady } = require("../config/db");
const { ensureAdminUser, sanitizeUser } = require("../data/store");

const getAdminConfig = () => ({
  name: process.env.ADMIN_NAME || "Admin",
  email: (process.env.ADMIN_EMAIL || "admin@mini-event-app.local").trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "Admin12345!",
});

const ensureAdminAccount = async () => {
  const config = getAdminConfig();

  if (databaseReady()) {
    const existingAdmin = await User.findOne({ email: config.email });

    if (existingAdmin) {
      return sanitizeUser(existingAdmin.toObject());
    }

    const hashedPassword = await bcrypt.hash(config.password, 10);
    const adminUser = await User.create({
      name: config.name,
      email: config.email,
      password: hashedPassword,
      role: "admin",
    });

    return sanitizeUser(adminUser.toObject());
  }

  return ensureAdminUser(bcrypt);
};

module.exports = ensureAdminAccount;
