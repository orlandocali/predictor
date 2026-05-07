# api-plan.md

# FIFA World Cup 2026 Prediction App - API Plan

## Overview

This document defines the REST API structure for the application.

Base URL:

```text
/api/v1
```

> Exception: `/api/health` is intentionally unversioned (standard for health checks).

Authentication:

```text
JWT Bearer Token
```

Response format:

```json
{
  "data": {},
  "error": null
}
```

---

# Authentication API

## POST /api/v1/auth/login

Authenticate user.

### Request

```json
{
  "username": "orlando",
  "password": "password"
}
```

### Response

```json
{
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "123",
    "username": "orlando",
    "role": "USER"
  }
}
```

---

## POST /api/v1/auth/refresh

Exchange a valid refresh token for a new access token.

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

---

## POST /api/v1/auth/logout

Invalidate the provided refresh token.

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

---

## GET /api/v1/auth/me

Returns the authenticated user profile. Requires valid JWT.

---

# Health API

## GET /api/health

Basic health check endpoint. Intentionally unversioned.

### Response

```json
{
  "status": "UP"
}
```

---

# Matches API (User-facing)

## GET /api/v1/matches

Returns all matches visible to authenticated users.

### Query Parameters

| Parameter | Description      |
| --------- | ---------------- |
| stage     | Filter by stage  |
| status    | Filter by status |

---

## GET /api/v1/matches/{id}

Returns match details.

---

## GET /api/v1/matches/grouped

Returns matches grouped by stage and group name.

Used for tournament view pages.

---

# Predictions API

> Phase 4 — Not yet implemented.

## GET /api/v1/predictions/me

Returns logged user predictions.

---

## GET /api/v1/predictions/match/{matchId}

Returns current user prediction for a match.

---

## POST /api/v1/predictions

Creates prediction.

### Request

```json
{
  "matchId": "123",
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "predictedPenaltyWinner": "HOME"
}
```

---

## PUT /api/v1/predictions/{id}

Updates prediction.

Validation:

* prediction must not be locked

---

# Rankings API

> Phase 6 — Not yet implemented.

## GET /api/v1/rankings

Returns paginated leaderboard.

### Query Parameters

| Parameter | Description |
| --------- | ----------- |
| page      | Page number |
| size      | Page size   |

### Response

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100
}
```

---

## GET /api/v1/rankings/me

Returns current logged-in user ranking position.

### Response

```json
{
  "position": 12,
  "totalPoints": 18
}
```

---

# Admin API

All admin endpoints require:

```text
ROLE_ADMIN
```

---

# Admin Users API

## POST /api/v1/admin/users

Create user.

---

## GET /api/v1/admin/users

List all users.

---

## GET /api/v1/admin/users/{id}

Get user by ID.

---

## PUT /api/v1/admin/users/{id}

Update user.

---

## PATCH /api/v1/admin/users/{id}/status

Toggle user active/inactive status.

---

# Admin Matches API

## POST /api/v1/admin/matches/

Create match.

---

## GET /api/v1/admin/matches/

List all matches (admin view).

### Query Parameters

| Parameter | Description      |
| --------- | ---------------- |
| stage     | Filter by stage  |
| status    | Filter by status |

---

## GET /api/v1/admin/matches/{id}

Get match by ID.

---

## PUT /api/v1/admin/matches/{id}

Update match.

---

## DELETE /api/v1/admin/matches/{id}

Delete match.

---

## POST /api/v1/admin/matches/sync

Sync matches from external World Cup API.

---

## POST /api/v1/admin/matches/{id}/result

> Phase 5 — Not yet implemented.

Publish official result and trigger scoring.

### Request

```json
{
  "homeScore": 2,
  "awayScore": 1,
  "penaltyWinner": null
}
```

---

# Error Handling

Standard error response:

```json
{
  "timestamp": "2026-01-01T10:00:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Prediction is locked",
  "path": "/api/v1/predictions/123"
}
```

---

# Validation Rules

## Prediction Validation

* match must exist
* prediction must be unique per user
* prediction must not be locked
* scores must be >= 0

---

# Security Rules

## Public Endpoints

| Endpoint              |
| --------------------- |
| /api/health           |
| /api/v1/auth/login    |
| /api/v1/auth/refresh  |
| /api/v1/auth/logout   |

---

## Authenticated Endpoints

Require valid JWT.

---

## Admin Endpoints

Require:

```text
ROLE_ADMIN
```

---

# Future API Considerations

Potential future endpoints:

* notifications
* statistics
* matchday rankings
* websocket live updates

Out of scope for v1.
