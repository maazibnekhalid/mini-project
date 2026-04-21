const Event = require("../models/Event");
const { databaseReady } = require("../config/db");
const {
  createEvent: createLocalEvent,
  getAllEvents,
  deleteEventById,
  updateEventById,
} = require("../data/store");

// PDF Requirement: File uploads
// Uploaded file paths are normalized to /uploads/... so the frontend can render them.
const normalizePath = (value) => {        // If the value is falsy (undefined, null, empty string), return an empty string to prevent errors in the frontend when rendering image URLs.
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\\/g, "/");   // Normalize Windows backslashes to forward slashes for consistent URL formatting across different operating systems.
  const uploadsIndex = normalized.lastIndexOf("/uploads/");   // If the normalized path contains "/uploads/", return the substring starting from the last occurrence of "/uploads/" to ensure we get the correct relative path for frontend rendering.

  if (uploadsIndex >= 0) {
    return normalized.slice(uploadsIndex + 1);
  }

  if (normalized.startsWith("uploads/")) {
    return normalized;
  }

  const filename = normalized.split("/").pop();
  return filename ? `uploads/${filename}` : "";
};

// PDF Requirement: Event Management - Create
// Creates one event with title, description, date, location, cover image, and gallery files.
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

// show event list
// Everyone, including guests, can load the shared event list from this endpoint.
exports.getEvents = async (req, res) => {
  try {
    const events = databaseReady()
      ? await Event.find().sort({ date: 1 })
      : await getAllEvents();

    return res.json(events);
  } catch {
    return res.status(500).json({ message: "Unable to fetch events right now." });
  }
};

// PDF Requirement: Event Management - Delete
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

// PDF Requirement: Event Management - Edit
// Updates a user's existing event, including optional replacement media uploads.
exports.updateEvent = async (req, res) => {
  try {
    const { title = "", description = "", date = "", location = "" } = req.body;

    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      return res.status(400).json({ message: "All event fields are required." });
    }

    const imageUrl = req.files?.image?.[0]
      ? normalizePath(req.files.image[0].path)
      : undefined;
    const gallery = req.files?.gallery?.length
      ? req.files.gallery.map((file) => normalizePath(file.path))
      : undefined;

    if (databaseReady()) {
      const currentEvent = await Event.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      });

      if (!currentEvent) {
        return res.status(404).json({ message: "Event not found." });
      }

      currentEvent.title = title.trim();
      currentEvent.description = description.trim();
      currentEvent.date = date;
      currentEvent.location = location.trim();

      if (typeof imageUrl === "string") {
        currentEvent.imageUrl = imageUrl;
      }

      if (gallery) {
        currentEvent.gallery = gallery;
      }

      await currentEvent.save();
      return res.json(currentEvent);
    }

    const updatedEvent = await updateEventById(req.params.id, req.user.id, {    // If the database is not ready, use the in-memory store function to update the event by ID, passing the updated fields. Only include the imageUrl and gallery fields if they were provided in the request to avoid overwriting existing media with undefined values.
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      ...(typeof imageUrl === "string" ? { imageUrl } : {}),
      ...(gallery ? { gallery } : {}),
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(updatedEvent);
  } catch {
    return res.status(500).json({ message: "Unable to update event right now." });
  }
};
