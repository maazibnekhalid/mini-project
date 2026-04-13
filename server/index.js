const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const next = require("next");
const { connectDB } = require("./config/db");
const ensureAdminAccount = require("./utils/ensureAdminAccount");

const app = express();
const port = process.env.PORT || 5000;
const nextApp = next({ dev: false, dir: path.join(__dirname, "../client") });
const handle = nextApp.getRequestHandler();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  return handle(req, res);
});

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error.name === "MulterError") {
    return res.status(400).json({ message: error.message });
  }

  return res.status(400).json({ message: error.message || "Something went wrong." });
});

const startServer = async () => {
  await nextApp.prepare();
  await connectDB();
  const adminUser = await ensureAdminAccount();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Admin ready: ${adminUser.email}`);
  });
};

startServer();
