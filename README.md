# Linemate Backend

Event Booking System REST API — built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **AI**: Groq SDK (Llama 3.1 for smart recommendations & search)
- **Deployment**: Vercel

## Project Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A [Groq](https://console.groq.com) API key (for AI features)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/linemate?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GROQ_API_KEY` | Groq API key for AI features (optional — falls back gracefully) |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |
| `NODE_ENV` | Environment (`development` / `production`) |

### Seed Database

```bash
npm run seed
```

This creates:
- 4 demo users (see credentials below)
- 12 sample events across categories
- 2 sample bookings for the demo user

**Demo Accounts:**

| Email | Password |
|---|---|
| demo@linemate.com | demo123 |
| john@example.com | password123 |
| jane@example.com | password123 |
| admin@linemate.com | admin123 |

### Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`.

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All booking endpoints require a `Bearer` token in the `Authorization` header.

#### POST `/api/auth/register`

Register a new user.

```json
{ "name": "John", "email": "john@example.com", "password": "password123" }
```

#### POST `/api/auth/login`

Login and receive a JWT token.

```json
{ "email": "john@example.com", "password": "password123" }
```

#### GET `/api/auth/me` 🔒

Get current user profile. Requires authentication.

### Events

#### GET `/api/events`

List all upcoming events. Supports query parameters:

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `search` | string | Search by name, description, venue |
| `sort` | string | `date`, `date-desc`, `name`, `price`, `price-desc`, `seats` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

#### GET `/api/events/:id`

Get a single event by ID.

#### GET `/api/events/meta/categories`

Get all available event categories.

### Bookings 🔒

All booking endpoints require authentication.

#### POST `/api/bookings`

Create a new booking.

```json
{ "eventId": "event_id_here", "seats": 2 }
```

Constraints: 1-10 seats per booking, cannot exceed available seats, cannot book past events.

#### GET `/api/bookings`

Get all bookings for the authenticated user.

#### GET `/api/bookings/:id`

Get a specific booking (must belong to the user).

#### PUT `/api/bookings/:id/cancel`

Cancel a booking. Seats are automatically released back to the event.

### AI Features

#### POST `/api/ai/recommendations`

Get AI-powered event recommendations.

```json
{ "preferences": "I like tech and music events, free or under $50" }
```

#### POST `/api/ai/search`

Smart semantic search for events using natural language.

```json
{ "query": "outdoor music festivals this month" }
```

#### GET `/api/ai/insights/:eventId`

Get AI-generated insights and popularity stats for an event.

## Design Decisions

### Atomic Operations for Booking
Bookings use `findOneAndUpdate` with a `$gte` condition on available seats to prevent race conditions. If two users try to book the last seat simultaneously, only one succeeds.

### Graceful AI Fallback
All AI endpoints have fallback logic. If the Groq API is unavailable, the system falls back to traditional search/sort without breaking the user experience.

### Indexes
Database indexes are created on frequently queried fields: event date, category, and a text index on name/description/venue for fast search.

### Rate Limiting
API-wide rate limiting (200 requests per 15 minutes) via `express-rate-limit`.

### CORS
Dynamic CORS configuration that allows both local development and deployed frontend URLs.

## Assumptions

- Users can book a maximum of 10 seats per transaction.
- Only future events can be booked (past events are excluded from booking).
- Cancelled bookings release seats back to the event inventory immediately.
- AI features are additive and the app functions fully without them.
- One user can make multiple bookings for the same event.
- Event prices are per seat.
