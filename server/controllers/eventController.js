const Event = require("../models/Event");
const { databaseReady } = require("../config/db");
const { createEvent: createLocalEvent, getEventsByUser, deleteEventById } = require("../data/store");

const normalizePath = (value) => value?.replace(/\\/g, "/") || "";

exports.createEvent = async (req, res) => {
  try {
    const { title = "", description = "", date = "", location = "" } = req.body;

    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      return res.status(400).json({ message: "All event fields are required." });
    }

    const imageUrl = normalizePath(req.files?.image?.[0]?.path);
    const gallery = (req.files?.gallery || []).map((file) => normalizePath(file.path));

    let event;
    if (databaseReady()) {
      event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim(),
        imageUrl,
        gallery,
        createdBy: req.user.id,
      });
    } else {
      event = await createLocalEvent({
        title,
        description,
        date,
        location,
        imageUrl,
        gallery,
        createdBy: req.user.id,
      });
    }

    return res.status(201).json(event);
  } catch {
    return res.status(500).json({ message: "Unable to create event right now." });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = databaseReady()
      ? await Event.find({ createdBy: req.user.id }).sort({ date: 1 })
      : await getEventsByUser(req.user.id);

    return res.json(events);
  } catch {
    return res.status(500).json({ message: "Unable to fetch events right now." });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    if (databaseReady()) {
      const deletedEvent = await Event.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user.id,
      });

      if (!deletedEvent) {
        return res.status(404).json({ message: "Event not found." });
      }
    } else {
      const deleted = await deleteEventById(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found." });
      }
    }

    return res.json({ message: "Deleted" });
  } catch {
    return res.status(500).json({ message: "Unable to delete event right now." });
  }
};
