# Chaupal: Mini Social Media Platform

CodeAlpha Full Stack Development Internship, Task 2.

A small social network where you can create an account, write posts, like and comment on them,
and follow other people to build your own home feed.

## Features
- Register and log in (passwords hashed with bcrypt, sessions with JWT)
- User profiles with an editable bio, follower and following counts
- Create and delete posts (up to 500 characters)
- Like and unlike posts
- Comment on posts
- Follow and unfollow people, with a "Following" feed and an "Everyone" feed
- Search for people by username

## Tech stack
- Frontend: React 18, React Router, Vite, plain CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JSON Web Tokens

## Project structure
```
server/   Express API (models, routes, auth middleware)
client/   React app (pages, components)
```

## Run it locally

You need Node.js 18+ and MongoDB (local install, or a free MongoDB Atlas connection string).

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
# open .env and set MONGO_URI and JWT_SECRET
npm run dev
```
The API runs on http://localhost:5000.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173. The dev server forwards `/api` requests to the backend.

## API overview

| Method | Route | What it does |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Current user |
| GET | /api/users?q= | Search people |
| GET | /api/users/:id | Profile with counts |
| PUT | /api/users/me | Update your bio |
| POST | /api/users/:id/follow | Follow or unfollow |
| POST | /api/posts | Create a post |
| GET | /api/posts/feed | Posts from people you follow, plus yours |
| GET | /api/posts/explore | All posts |
| GET | /api/posts/user/:id | One user's posts |
| DELETE | /api/posts/:id | Delete your post |
| POST | /api/posts/:id/like | Like or unlike |
| GET | /api/posts/:id/comments | List comments |
| POST | /api/posts/:id/comments | Add a comment |

All routes except register and login need an `Authorization: Bearer <token>` header.

## Author
Pallavi Tavva
