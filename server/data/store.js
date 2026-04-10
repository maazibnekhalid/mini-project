const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const dataDir = path.join(__dirname);
const dataFile = path.join(dataDir, "app-data.json");

const defaultState = {
  users: [],
  events: [],
};

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultState, null, 2), "utf8");
  }
};

const readStore = async () => {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw);
};

const writeStore = async (data) => {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const createUser = async ({ name, email, password, role = "user" }) => {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = store.users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = {
    _id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  await writeStore(store);

  return user;
};

const findUserByEmail = async (email) => {
  const store = await readStore();
  return store.users.find((user) => user.email === email.trim().toLowerCase()) || null;
};

const createEvent = async ({ title, description, date, location, imageUrl, gallery, createdBy }) => {
  const store = await readStore();

  const event = {
    _id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    date,
    location: location.trim(),
    imageUrl: imageUrl || "",
    gallery: gallery || [],
    createdBy,
    createdAt: new Date().toISOString(),
  };

  store.events.push(event);
  await writeStore(store);

  return event;
};

const getEventsByUser = async (userId) => {
  const store = await readStore();

  return store.events
    .filter((event) => event.createdBy === userId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const deleteEventById = async (eventId, userId) => {
  const store = await readStore();
  const eventIndex = store.events.findIndex(
    (event) => event._id === eventId && event.createdBy === userId
  );

  if (eventIndex === -1) {
    return false;
  }

  store.events.splice(eventIndex, 1);
  await writeStore(store);
  return true;
};

module.exports = {
  createEvent,
  createUser,
  deleteEventById,
  findUserByEmail,
  getEventsByUser,
  sanitizeUser,
};
