const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
} = require("../controllers/eventController");

router.get("/", auth, getEvents);

router.post(
  "/",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createEvent
);

router.delete("/:id", auth, deleteEvent);

router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateEvent
);

module.exports = router;
