# BACKEND_2 (Express + MongoDB, JWT-only)

This is a Node.js (JavaScript) re-implementation of the FastAPI project `Dahboard_Backend2`. It mirrors the same routes, role-based access, and MongoDB data model using Express and the native MongoDB driver. Authentication is JWT-only (no sessions/cookies).

## Stack
- Express 5
- MongoDB Node.js driver
- CORS, Helmet, Morgan

## Folder Structure
```
src/
  server.js            # App bootstrap, middleware, sessions, route mounting
  config/database.js   # Mongo connection + index creation
  routes/              # Feature routers
    auth.js
    protected.js       # JWT-protected routes (mounted under /protected-jwt)
    users_chat.js
    guest_chat.js
    forms.js
    form_responses.js
  utils/
    json.js            # Helpers to make Mongo docs JSON-safe
tests/
  smoke.js             # Minimal health check
```

## Environment
Create a `.env` file (already scaffolded):
```
PORT=8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB=Anuvadini
CORS_ORIGINS=http://localhost:5173,https://96a5ab90a03d.ngrok-free.app,https://a0df7c227057.ngrok-free.app
JWT_SECRET=change_me_strong
```

## Run
```
npm install
npm run dev
# or
npm start
```

## Routes
- Auth: `/auth/signup`, `/auth/login` (returns JWT), `/auth/create-admin`, `/auth/logout` (client-side discard guidance)
- Protected (JWT): `/protected-jwt/me`, `/protected-jwt/super-admin-data`, `/protected-jwt/admin-stats`, `/protected-jwt/all-users`
- Users Chat: `/users_chat/message`, `/users_chat/history`
- Guest Chat: `/guest_chat/message/:guest_id`, `/guest_chat/history/:guest_id`
- Forms: `/forms/create`, `/forms/all`, `/forms`, `/forms/:form_id`, `/forms/:form_id/summary`
- Form Responses: `/form_responses/submit`, `/form_responses/submit_public`, `/form_responses/:form_id/my`

## Auth behavior (JWT-only)
- Send `Authorization: Bearer <token>` on all protected routes
- Passwords hashed with bcrypt on signup; verified on login
- Claims include at least: `sub` (user id), `role`, `email`

## Authorization
- Mirrors FastAPI roles: owner-only deletes, admin/super_admin visibility, user-only submissions
- Multi-tenant ready: add `tenant_id` to JWT and enforce in queries if needed

## Testing
- Minimal smoke test: `npm test` (pings `/health`).
- Use the provided JWT curl examples in `docs/curl-examples.md`.

## Security notes
- Use a strong `JWT_SECRET` (rotate periodically)
- Prefer short-lived access tokens (15–60 minutes) and a refresh-token flow if needed
- Set `CORS_ORIGINS` to only trusted origins in production



