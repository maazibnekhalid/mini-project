const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { getOverview } = require("../controllers/adminController");

router.get("/overview", auth, admin, getOverview);

module.exports = router;
