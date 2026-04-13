# Mini Event Management Application

Full-stack event management application built from the provided technical assignment.

This project includes:

- Public landing page
- User signup and login
- Guest mode
- Admin login and admin overview
- Protected dashboard for authenticated users
- Event create, edit, delete, and listing
- Cover image and gallery/document uploads
- MongoDB persistence with Mongoose
- Local JSON fallback when MongoDB is unavailable

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Context API
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- bcryptjs

## Roles And Behavior

### Guest

- Can enter the app using `Continue as guest`
- Can view the public site and guest dashboard preview
- Cannot create, edit, or delete events
- Sees prompts to register or log in

### User

- Can sign up and log in
- Can access the protected dashboard
- Can create, edit, and delete only their own events
- Can upload one cover image and multiple gallery/document files

### Admin

- Can log in using the seeded admin account
- Can see all users
- Can see all events from all users
- Uses a separate admin login page

## Local URLs

- Frontend: `http://localhost:3000`
- Home page: `http://localhost:3000/`
- User login: `http://localhost:3000/login`
- User signup: `http://localhost:3000/signup`
- Admin login: `http://localhost:3000/admin-login`
- Dashboard: `http://localhost:3000/dashboard`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Project Structure

### Frontend

```text
client/
  src/
    app/
    components/
    context/
    hooks/
    services/
    utils/
```

### Backend

```text
server/
  config/
  controllers/
  data/
  middleware/
  models/
  routes/
  uploads/
  utils/
```

## Setup

### 1. Install Dependencies

From the repo root:

```powershell
npm install
```

This installs both `server` and `client` workspace dependencies.

Backend:

```powershell
cd server
npm install
```

Frontend:

```powershell
cd client
npm install
```

### 2. Configure Environment Variables

Create `server/.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-event-app
JWT_SECRET=replace-with-a-secure-secret
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@mini-event-app.local
ADMIN_PASSWORD=Admin12345!
```

You can also copy values from:

- [server/.env.example](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/.env.example)

### 3. Run The App

Backend:

```powershell
cd server
npm run dev
```

Frontend:

```powershell
cd client
npm run dev
```

## MongoDB

MongoDB setup details are documented in:

- [MONGODB_SETUP.md](C:/Users/maazi/OneDrive/Desktop/mini-event-app/MONGODB_SETUP.md)

### How To Check If MongoDB Is Working

#### Option 1. Server terminal

When the backend starts, you should see:

```text
MongoDB connected
```

If you see:

```text
MongoDB connection skipped. Using local JSON storage fallback.
```

then the app is not using MongoDB and is saving to local JSON instead.

#### Option 2. MongoDB Compass

Use:

- Connection string: `mongodb://localhost:27017`
- Database: `mini-event-app`
- Collections:
  - `users`
  - `events`

#### Option 3. mongosh

```powershell
mongosh
use mini-event-app
show collections
db.users.find().pretty()
db.events.find().pretty()
```

### Railway Deployment

To deploy the full app on Railway, use two services:

1. Backend: deploy the `/server` folder as a Node service.
2. Frontend: deploy the `/client` folder as a Next.js service.

Required environment variables:

- `MONGO_URI` — your MongoDB connection string.
- `JWT_SECRET` — a secure JWT signing key.
- `NEXT_PUBLIC_API_URL` — the backend service URL ending with `/api`.

Example for Railway frontend service:

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app/api
```

Railway service commands:

- Backend install: `npm install`
- Backend start: `npm start`
- Frontend install: `npm install`
- Frontend build: `npm run build`
- Frontend start: `npm run start`

For Railway production install, use:

```bash
npm install --omit=dev --workspaces
```

This avoids the npm warning about `config production` while still installing only production dependencies.

If you want to deploy only the backend, keep `NEXT_PUBLIC_API_URL` set in the frontend service and use the backend API URL there.

### Fallback Storage

If MongoDB is not available, the backend uses:

- [server/data/app-data.json](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/data/app-data.json)

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Events

- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Admin

- `GET /api/admin/overview`

## Main Functionalities And Where They Are Implemented

### 1. Public landing page

Purpose:
- Shows the app introduction
- Lets users register, log in, continue as guest, or use admin login

Files:
- [client/src/app/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/page.tsx)

### 2. Signup and login

Purpose:
- User registration
- User login
- Admin login support through the same auth backend

Files:
- [client/src/app/signup/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/signup/page.tsx)
- [client/src/app/login/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/login/page.tsx)
- [client/src/app/admin-login/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/admin-login/page.tsx)
- [client/src/services/auth.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/services/auth.ts)
- [server/controllers/authController.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/controllers/authController.js)
- [server/routes/authRoutes.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/routes/authRoutes.js)

### 3. Auth state management

Purpose:
- Stores current user session
- Handles guest mode
- Detects admin/user/guest role in the UI

Files:
- [client/src/context/AuthContext.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/context/AuthContext.tsx)
- [client/src/hooks/useAuth.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/hooks/useAuth.ts)
- [client/src/components/providers/AppProviders.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/components/providers/AppProviders.tsx)

### 4. Global notifications

Purpose:
- Shows toast-style success, error, and info messages

Files:
- [client/src/context/NotificationContext.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/context/NotificationContext.tsx)
- [client/src/hooks/useNotifications.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/hooks/useNotifications.ts)
- [client/src/components/ui/ToastViewport.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/components/ui/ToastViewport.tsx)

### 5. Protected dashboard

Purpose:
- Shows different dashboard experiences for guest, user, and admin
- User gets add/manage event windows
- Admin gets platform overview

Files:
- [client/src/app/dashboard/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/dashboard/page.tsx)

### 6. Event create, edit, delete, list

Purpose:
- Implements CRUD for user-owned events

Files:
- [client/src/components/events/EventForm.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/components/events/EventForm.tsx)
- [client/src/services/event.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/services/event.ts)
- [server/controllers/eventController.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/controllers/eventController.js)
- [server/routes/eventRoutes.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/routes/eventRoutes.js)

### 7. File upload handling

Purpose:
- Supports one cover image
- Supports multiple gallery or brochure/document uploads
- Stores files inside local `/uploads`

Files:
- [server/middleware/upload.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/middleware/upload.js)
- [server/uploads](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/uploads)
- [server/controllers/eventController.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/controllers/eventController.js)
- [client/src/utils/files.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/utils/files.ts)

### 8. Form validation

Purpose:
- Validates required fields
- Validates upload type restrictions
- Validates file size limits

Files:
- [client/src/utils/validation.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/utils/validation.ts)
- [client/src/components/events/EventForm.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/components/events/EventForm.tsx)
- [client/src/app/login/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/login/page.tsx)
- [client/src/app/signup/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/signup/page.tsx)

### 9. Admin overview

Purpose:
- Allows admin to inspect all users and all events

Files:
- [client/src/app/admin-login/page.tsx](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/app/admin-login/page.tsx)
- [client/src/services/admin.ts](C:/Users/maazi/OneDrive/Desktop/mini-event-app/client/src/services/admin.ts)
- [server/controllers/adminController.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/controllers/adminController.js)
- [server/routes/adminRoutes.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/routes/adminRoutes.js)
- [server/middleware/adminMiddleware.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/middleware/adminMiddleware.js)

### 10. JWT protection and role-based access

Purpose:
- Protects dashboard and event routes
- Protects admin overview route

Files:
- [server/middleware/authMiddleware.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/middleware/authMiddleware.js)
- [server/middleware/adminMiddleware.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/middleware/adminMiddleware.js)
- [server/utils/generateToken.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/utils/generateToken.js)

### 11. MongoDB connection and startup bootstrapping

Purpose:
- Connects to MongoDB
- Seeds admin account
- Starts Express server

Files:
- [server/config/db.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/config/db.js)
- [server/index.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/index.js)
- [server/utils/ensureAdminAccount.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/utils/ensureAdminAccount.js)

### 12. Database models

Purpose:
- Defines persisted user and event structure

Files:
- [server/models/users.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/models/users.js)
- [server/models/User.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/models/User.js)
- [server/models/Event.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/models/Event.js)

### 13. Local fallback store

Purpose:
- Keeps the app usable even if MongoDB is not available

Files:
- [server/data/store.js](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/data/store.js)
- [server/data/app-data.json](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/data/app-data.json)

## Admin Account

Current default admin credentials:

- Email: `admin@mini-event-app.local`
- Password: `Admin12345!`

You can change these in:

- [server/.env](C:/Users/maazi/OneDrive/Desktop/mini-event-app/server/.env)

## Notes

- The backend now uses MongoDB when the connection succeeds
- If MongoDB is unavailable, it automatically falls back to local JSON storage
- Uploaded files are stored locally in `server/uploads`
- Existing requirement-based comments were added inside the code to help map PDF requirements to implementation
