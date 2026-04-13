const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const { databaseReady } = require("../config/db");
const { createUser, findUserByEmail, sanitizeUser } = require("../data/store");

// PDF Requirement: Authentication
// Handles user registration, password hashing, and JWT session creation.
exports.signup = async (req, res) => {
  try {
    const { name = "", email = "", password = "" } = req.body;

    if (!name.trim() || !email.trim() || !password.trim()) {          //checking for empty
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const hashed = await bcrypt.hash(password, 10);       //hashing the password

    let user;     
    if (databaseReady()) {      // If the database is ready, use Mongoose to check for existing user and create new user
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      user = await User.create({    // Create new user in MongoDB
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
      });
    } else {                       // If the database is not ready, use in-memory store to check for existing user and create new user
      user = await createUser({
        name,
        email,
        password: hashed,
      });
    }

    return res.status(201).json({         // Return the created user and a JWT token
      user: sanitizeUser(user.toObject ? user.toObject() : user),
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {               // Handle specific error for duplicate user
    if (error.message === "User already exists") {
      return res.status(409).json({ message: "User already exists." });
    }

    return res.status(500).json({ message: "Unable to sign up right now." });
  }
};

// PDF Requirement: Authentication
// Handles login for normal users and seeded admin users.
exports.login = async (req, res) => {     // Extract email and password from request body, with default empty strings to prevent undefined errors
  try {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = databaseReady()          // If the database is ready, use Mongoose to find the user by email; otherwise, use the in-memory store function to find the user by email
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : await findUserByEmail(email);

    if (!user) {                  // If no user is found, return an error response
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {             // If the password does not match, return an error response
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({         // If authentication is successful, return the user data and a JWT token
      user: sanitizeUser(user.toObject ? user.toObject() : user),
      token: generateToken(user._id.toString(), user.role),
    });
  } catch {
    return res.status(500).json({ message: "Unable to log in right now." });
  }
};
