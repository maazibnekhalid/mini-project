const Event = require("../models/Event");
const User = require("../models/User");
const { databaseReady } = require("../config/db");
const { getAllEvents, getAllUsers } = require("../data/store");

// Custom Requirement: Admin overview
// Admin can inspect all users and all events from one dashboard endpoint.
exports.getOverview = async (req, res) => {     // If the database is ready, use Mongoose to fetch all users and events; otherwise, use in-memory store functions to fetch all users and events. Return the data in a structured format, including user details for each event's creator.
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

    return res.json({         // Return the data in a structured format, including user details for each event's creator. If a user is not found for an event's creator, include a placeholder "Unknown user" object.
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
