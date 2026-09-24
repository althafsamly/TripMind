# 📡 TripMind RESTful API Documentation

This document provides a comprehensive technical reference for the backend API endpoints of the **TripMind** AI-powered travel planning platform.

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 📑 Table of Contents
1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Trip Planning & Management Endpoints](#2-trip-planning--management-endpoints)
3. [Gemini AI Natural Language & Voice Endpoints](#3-gemini-ai-voice--nlp-endpoints)
4. [Hotel & Accommodation Endpoints](#4-hotel--accommodation-endpoints)
5. [Activities & Experiences Endpoints](#5-activities--experiences-endpoints)
6. [Vehicle Rental & Logistics Endpoints](#6-vehicle-rental--logistics-endpoints)
7. [Food & Dining Endpoints](#7-food--dining-endpoints)
8. [Media & Image Resolution Endpoints](#8-media--image-resolution-endpoints)
9. [Error Codes & Responses](#9-error-codes--responses)

---

## 1. Authentication Endpoints

### 1.1 Register User
Creates a new traveler account with encrypted password storage.

- **Endpoint:** `POST /api/auth/register`
- **Access:** Public

#### Request Body:
```json
{
  "name": "Thakshila Saduni",
  "email": "traveler@example.com",
  "password": "SecurePassword123"
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "67f2b98e10d24c0012345678",
    "name": "Thakshila Saduni",
    "email": "traveler@example.com"
  }
}
```

#### Error Response (`400 Bad Request`):
```json
{
  "message": "User already exists"
}
```

---

### 1.2 User Login
Authenticates an existing user and returns a JSON Web Token (JWT).

- **Endpoint:** `POST /api/auth/login`
- **Access:** Public

#### Request Body:
```json
{
  "email": "traveler@example.com",
  "password": "SecurePassword123"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67f2b98e10d24c0012345678",
    "name": "Thakshila Saduni",
    "email": "traveler@example.com"
  }
}
```

---

## 2. Trip Planning & Management Endpoints

All endpoints in this section require standard JWT authentication.

### 2.1 Save a Planned Trip
Saves a fully generated itinerary, selected hotels, and activities to MongoDB.

- **Endpoint:** `POST /api/trips`
- **Access:** Private (`Bearer <token>`)

#### Request Body:
```json
{
  "destination": "Ella",
  "budget": 75000,
  "startDate": "2026-10-15",
  "endDate": "2026-10-18",
  "days": 4,
  "travelers": 2,
  "tripType": "Couple",
  "interests": ["Hiking", "Nature", "Photography"],
  "selectedHotel": {
    "name": "Ella Mountain View Resort",
    "pricePerNight": 12500,
    "rating": 4.8
  },
  "selectedActivities": [
    {
      "title": "Little Adam's Peak Hike",
      "category": "Adventure",
      "estimatedCost": 1500
    },
    {
      "title": "Nine Arches Bridge Train Watching",
      "category": "Sightseeing",
      "estimatedCost": 0
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Ella Town Walk",
      "description": "Scenic arrival via train and evening relaxation."
    }
  ]
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "Trip saved successfully",
  "trip": {
    "_id": "67f3a12b45e98f0011223344",
    "userId": "67f2b98e10d24c0012345678",
    "destination": "Ella",
    "budget": 75000,
    "startDate": "2026-10-15",
    "endDate": "2026-10-18",
    "days": 4,
    "travelers": 2,
    "tripType": "Couple",
    "createdAt": "2026-09-24T13:10:00.000Z"
  }
}
```

---

### 2.2 Get User Trips
Retrieves all historical and upcoming saved trips for the authenticated user.

- **Endpoint:** `GET /api/trips`
- **Access:** Private (`Bearer <token>`)

#### Success Response (`200 OK`):
```json
[
  {
    "_id": "67f3a12b45e98f0011223344",
    "destination": "Ella",
    "budget": 75000,
    "days": 4,
    "travelers": 2,
    "emoji": "🏔️",
    "startDate": "2026-10-15",
    "endDate": "2026-10-18"
  }
]
```

---

### 2.3 Get Single Trip By ID
- **Endpoint:** `GET /api/trips/:id`
- **Access:** Private (`Bearer <token>`)

#### Success Response (`200 OK`):
Returns the complete JSON schema of the specified trip document.

---

### 2.4 Delete Trip
- **Endpoint:** `DELETE /api/trips/:id`
- **Access:** Private (`Bearer <token>`)

#### Success Response (`200 OK`):
```json
{
  "message": "Trip deleted successfully"
}
```

---

## 3. Gemini AI Voice & NLP Endpoints

### 3.1 Parse Voice / Natural Language Prompt
Uses Google Gemini AI to parse conversational speech or text transcripts into structured trip configuration parameters.

- **Endpoint:** `POST /api/trips/parse-voice`
- **Access:** Public

#### Request Body:
```json
{
  "transcript": "I want to take my girlfriend for a 3 day trip to Ella next weekend with around 60k budget for hiking and cafes",
  "currentDate": "2026-09-24"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "plan": {
    "destination": "Ella",
    "budget": 60000,
    "tripType": "Couple",
    "travelers": 2,
    "days": 3,
    "startDate": "2026-09-26",
    "endDate": "2026-09-28",
    "interests": ["Hiking", "Nature", "Cafes"],
    "source": "gemini-1.5-flash"
  }
}
```

---

## 4. Hotel & Accommodation Endpoints

### 4.1 Query Recommended Hotels
Fetches budget-aligned and rating-optimized hotels for a specific Sri Lankan destination.

- **Endpoint:** `GET /api/hotels`
- **Access:** Public

#### Query Parameters:
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `destination` | string | Yes | Target city (e.g. `Ella`, `Kandy`, `Mirissa`) |
| `budget` | number | No | Total trip budget in LKR |
| `travelers` | number | No | Number of guests (default: `1`) |
| `startDate` | string | No | Check-in date (`YYYY-MM-DD`) |
| `endDate` | string | No | Check-out date (`YYYY-MM-DD`) |

#### Success Response (`200 OK`):
```json
{
  "destination": "Ella",
  "hotels": [
    {
      "id": "h-ella-01",
      "name": "Ella Mount View Guest Inn",
      "rating": 4.7,
      "pricePerNight": 11000,
      "currency": "LKR",
      "amenities": ["Free WiFi", "Mountain View Balcony", "Breakfast Included"],
      "image": "/images/hotels/ella_view.jpg"
    }
  ]
}
```

---

## 5. Activities & Experiences Endpoints

### 5.1 Query Activities & Experiences
Returns curated Sri Lankan adventures, cultural sites, and nature tours matching traveler budget and group composition.

- **Endpoint:** `GET /api/activities`
- **Access:** Public

#### Query Parameters:
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `destination` | string | Yes | Target destination (`Ella`, `Galle`, `Sigiriya`) |
| `budget` | number | No | Trip budget |
| `tripType` | string | No | `Solo`, `Couple`, `Family`, `Friends` |
| `category` | string | No | `Adventure`, `Culture`, `Relaxation`, `Wildlife` |

#### Success Response (`200 OK`):
```json
{
  "destination": "Ella",
  "activities": [
    {
      "id": "act-ella-01",
      "title": "Hiking Little Adam's Peak",
      "category": "Hiking & Adventure",
      "estimatedDurationHours": 2.5,
      "price": 0,
      "highlights": ["360 Degree Hill Country View", "Easy Hiking Trail"],
      "image": "/images/activities/little_adams_peak.jpg"
    }
  ]
}
```

---

## 6. Vehicle Rental & Logistics Endpoints

### 6.1 Query Recommended Transport
Fetches optimal transportation modes (Tuk-tuk, Sedan Car, KDH Van) based on distance, group size, and terrain.

- **Endpoint:** `GET /api/vehicles`
- **Access:** Public

#### Query Parameters:
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `destination` | string | Yes | Target destination |
| `travelers` | number | No | Group size |
| `tripType` | string | No | Travel style |

---

## 7. Food & Dining Endpoints

### 7.1 Query Authentic Local Dining
Provides curated restaurant, street food, and authentic dining recommendations.

- **Endpoint:** `GET /api/food`
- **Access:** Public

---

## 8. Media & Image Resolution Endpoints

### 8.1 Resolve High-Resolution Destination Images
Dynamically queries Wikimedia Commons and Pexels with local caching fallback for high-quality visual cards.

- **Endpoint:** `GET /api/images`
- **Access:** Public
- **Query Parameters:** `query` (e.g. `Nine Arch Bridge Ella`)

---

## 9. Error Codes & Responses

All API errors return consistent JSON responses:

| HTTP Code | Description | Typical Scenario |
|:---|:---|:---|
| `400 Bad Request` | Validation failure | Missing required fields, invalid parameters |
| `401 Unauthorized` | Auth failure | Missing or expired JWT token |
| `404 Not Found` | Resource not found | Trip ID does not exist |
| `500 Server Error` | Backend failure | Database connection drop or external AI API quota |

#### Standard Error Response Format:
```json
{
  "message": "Error description message",
  "error": "Detailed error context (in development mode)"
}
```

---
*Authored as part of the TripMind Technical Documentation Suite.*
