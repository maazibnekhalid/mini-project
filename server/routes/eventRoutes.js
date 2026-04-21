const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
} = require("../controllers/eventController");

// show event list
// Public read access lets guests and signed-in users browse every event.
router.get("/", getEvents);

router.post(
  "/",
  // give event authorization
  // Only signed-in users can create new events.
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createEvent
);

// give event authorization
// Only the authenticated event owner can delete an event.
router.delete("/:id", auth, deleteEvent);

router.put(
  "/:id",
  // give event authorization
  // Only the authenticated event owner can update an event.
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateEvent
);

module.exports = router;
