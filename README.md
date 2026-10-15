# BookNest

A MERN book review app: add books, read reviews, leave your own rating. Built to practise JWT authentication, bcrypt, ownership-based authorization and MongoDB relationships.

- **Live demo:** `<your-vercel-url>`
- **API:** `<your-render-url>`
- **GitHub:** https://github.com/`<your-username>`/booknest-mern
- **Demo login:** `demo@booknest.com` / `demo1234`

> The free Render server sleeps when idle. The first request can take about 50 seconds to wake it up.

## Screenshots

_Add 3-4 screenshots or a demo GIF here (books list, book detail, add book, my reviews)._

## Features

- Register and login with bcrypt-hashed passwords and JWT
- `protect` middleware on every write endpoint
- Add, edit and delete your own books (deleting a book removes its reviews)
- Browse books with search by title/author, genre filter and pagination
- Book detail with average rating (calculated on the server), review count and reviewer names
- One review per user per book (posting again updates it, enforced by a unique compound index)
- Edit/delete only your own review; My Reviews page
- Route guards, navbar that changes after login, loading / error / empty states, responsive layout
- helmet and express-rate-limit on the API

## Tech stack

React (Vite), React Router, Axios, Tailwind CSS, Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Login, returns JWT + user |
| GET | /api/books?search=&genre=&page=&limit= | Public | List books with average rating |
| GET | /api/books/genres | Public | List genres for the filter |
| GET | /api/books/:id | Public | Book detail + reviews |
| POST | /api/books | Logged in | Add a book |
| PUT | /api/books/:id | Owner only | Edit book |
| DELETE | /api/books/:id | Owner only | Delete book and its reviews |
| POST | /api/books/:id/reviews | Logged in | Add review, or update if already reviewed |
| DELETE | /api/reviews/:id | Owner only | Delete own review |
| GET | /api/reviews/me | Logged in | My reviews |

## Local setup

Requirements: Node 18+ and a MongoDB database (local or free MongoDB Atlas).

```bash
git clone https://github.com/<your-username>/booknest-mern.git
cd booknest-mern

# 1. Server
cd server
npm install
cp .env.example .env      # then fill in the values
npm run seed              # optional: demo user + sample books
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
cp .env.example .env      # then fill in the value
npm run dev               # http://localhost:5173
```

### Environment variables

`server/.env`

| Variable | Meaning |
|---|---|
| PORT | Port for the API (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Long random string used to sign tokens |
| CLIENT_URL | Allowed frontend origin for CORS, e.g. http://localhost:5173 (comma-separate for several) |

`client/.env`

| Variable | Meaning |
|---|---|
| VITE_API_URL | Base URL of the API, e.g. http://localhost:5000 (no trailing slash, no /api) |

## Security testing

I attacked my own API. Run the same checks with `cd server && npm run security-test` (pass your API URL as an argument to test the deployed server).

| Test | Expected | Result |
|---|---|---|
| Add a book or review without a token | 401 Unauthorized | _fill in_ |
| User A deletes User B's review | 403 Forbidden, review still exists | _fill in_ |
| User A edits or deletes User B's book | 403 Forbidden | _fill in_ |
| Rating 0 or 6 | 400 Bad Request | _fill in_ |
| Review the same book twice | Existing review updated, no duplicate | _fill in_ |
| Login/register response | Password hash never returned | _fill in_ |

Other protections: password field is `select: false`, auth inputs are type-checked against NoSQL injection, search input is regex-escaped, ids are validated, request bodies are size-limited, helmet and rate limiting are enabled.

## What I learned

_Write 3-4 sentences in your own words. Suggestions: why hiding a button is not security, how ownership checks work in the controller, how a unique compound index prevents duplicate reviews, what went wrong during deployment and how you fixed it._

## Deployment

- **Database:** MongoDB Atlas (free cluster, database user, network access).
- **Backend:** Render. Root directory `server`, build `npm install`, start `node server.js`, env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL).
- **Frontend:** Vercel. Root directory `client`, env var `VITE_API_URL` = your Render URL.
