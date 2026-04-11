const Event = require("../models/Event");
const User = require("../models/User");
const { databaseReady } = require("../config/db");
const { getAllEvents, getAllUsers } = require("../data/store");

exports.getOverview = async (req, res) => {
  try {
    if (databaseReady()) {
      const users = await User.find({}, "-password").lean();
      const events = await Event.find().populate("createdBy", "name email role").lean();

      return res.json({
        users,
        events,
      });
    }

    const [users, events] = await Promise.all([getAllUsers(), getAllEvents()]);

    return res.json({
      users,
      events: events.map((event) => ({
        ...event,
        createdBy:
          users.find((user) => user._id === event.createdBy) || {
            _id: event.createdBy,
            name: "Unknown user",
            email: "",
            role: "user",
          },
      })),
    });
  } catch {
    return res.status(500).json({ message: "Unable to load admin overview right now." });
  }
};
