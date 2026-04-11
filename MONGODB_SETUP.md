# MongoDB Setup

## Backend Env File

Create `server/.env` from `server/.env.example` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mini-event-app
JWT_SECRET=replace-with-a-secure-secret
```

## Option 1. Local MongoDB

1. Install MongoDB Community Server.
2. Start MongoDB locally.
3. Keep `MONGO_URI=mongodb://127.0.0.1:27017/mini-event-app`
4. Restart the backend with `npm run dev`

## Option 2. MongoDB Atlas

1. Create a free cluster on MongoDB Atlas.
2. Create a database user.
3. Add your current IP in Network Access.
4. Copy the connection string and place it in `server/.env`

Example:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster-url/mini-event-app?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-secure-secret
```

## Current Project Behavior

- If `MONGO_URI` is valid and reachable, the app uses MongoDB with Mongoose.
- If `MONGO_URI` is missing or still set to the placeholder, the backend falls back to local JSON storage so you can keep developing.
