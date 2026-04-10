const mongoose = require("mongoose");

let isDatabaseReady = false;

const hasUsableMongoUri = () => {
  const uri = process.env.MONGO_URI;

  return Boolean(uri) && !uri.includes("your_mongodb_connection");
};

const connectDB = async () => {
  if (!hasUsableMongoUri()) {
    console.warn("MongoDB connection skipped. Using local JSON storage fallback.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isDatabaseReady = true;
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed. Using local JSON storage fallback.");
    console.warn(error.message);
    isDatabaseReady = false;
    return false;
  }
};

const databaseReady = () => isDatabaseReady;

module.exports = {
  connectDB,
  databaseReady,
};
