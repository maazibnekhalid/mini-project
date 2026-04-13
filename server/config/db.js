const mongoose = require("mongoose");   // MongoDB connection setup

let isDatabaseReady = false;      // Flag to indicate if the database connection is ready

const hasUsableMongoUri = () => {     // Check if the MONGO_URI environment variable is set and does not contain the placeholder text
  const uri = process.env.MONGO_URI;

  return Boolean(uri) && !uri.includes("your_mongodb_connection");
};

const connectDB = async () => {     // Attempt to connect to MongoDB using the MONGO_URI environment variable
  if (!hasUsableMongoUri()) {
    console.warn("MongoDB connection skipped. Using local JSON storage fallback.");
    return false;
  }

  try {     // Attempt to connect to MongoDB
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

const databaseReady = () => isDatabaseReady;      // Function to check if the database connection is ready

module.exports = {      // Export the functions for use in other parts of the application
  connectDB,
  databaseReady,
};
