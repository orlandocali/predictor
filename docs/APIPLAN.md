# api-plan.md

# World Cup 2026 Prediction App - API Plan

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
  "accessToken": "jwt-token",
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

| Parameter | Description           |
| --------- | --------------------- |
| stage     | Filter by stage       |
| status    | Filter by status      |
| groupName | Filter by group (A-H) |

---

## GET /api/v1/matches/{id}

Returns match details.

---

## GET /api/v1/matches/grouped

Returns matches grouped by stage and group name.

Used for tournament view pages.

---

# Predictions API

## GET /api/v1/predictions

Returns the authenticated user's predictions.

---

## GET /api/v1/predictions/match/{matchId}

Returns the authenticated user's prediction for a specific match.

---

## POST /api/v1/predictions

Creates or updates a prediction (upsert by userId + matchId).

### Request

```json
{
  "matchId": "123",
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "predictedPenaltyWinner": "HOME"
}
```

Validation:

* match must exist and be SCHEDULED
* kickoff must be more than 12 hours away
* scores must be >= 0
* knockout matches require `predictedPenaltyWinner`

---

## PUT /api/v1/predictions/{id}

Updates an existing prediction by ID.

### Request

```json
{
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "predictedPenaltyWinner": "HOME"
}
```

Validation:

* prediction must belong to the authenticated user
* prediction must not be locked
* match must still be open (SCHEDULED, within 12h window)

---

# Rankings API

## GET /api/v1/rankings

Returns paginated leaderboard sorted by totalPoints DESC.

### Query Parameters

| Parameter | Description                   |
| --------- | ----------------------------- |
| page      | Page number (default 0)       |
| size      | Page size (default 20, max 100) |

### Response

```json
{
  "content": [],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0
}
```

---

## GET /api/v1/rankings/me

Returns the authenticated user's ranking position and stats.

### Response

```json
{
  "rank": 12,
  "totalPoints": 18,
  "username": "orlando"
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

List all users (paginated).

### Query Parameters

| Parameter | Description             |
| --------- | ----------------------- |
| page      | Page number (default 0) |
| size      | Page size (default 20)  |

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

| Parameter | Description           |
| --------- | --------------------- |
| stage     | Filter by stage       |
| status    | Filter by status      |
| groupName | Filter by group (A-H) |

---

## GET /api/v1/admin/matches/{id}

Get match by ID.

---

## PUT /api/v1/admin/matches/{id}

Update match.

---

## PATCH /api/v1/admin/matches/{id}/status

Transition match status. Valid transitions: SCHEDULED → LOCKED → FINISHED → SCORED.

### Request

```json
{ "status": "LOCKED" }
```

---

## DELETE /api/v1/admin/matches/{id}

Delete match.

---

## POST /api/v1/admin/matches/sync

Sync matches from external World Cup API (upsert by externalMatchId).

---

## POST /api/v1/admin/matches/{id}/result

Submit official result for a group-stage match. Triggers scoring and transitions match to SCORED.

### Request

```json
{
  "homeScore": 2,
  "awayScore": 1,
  "penaltyWinner": null,
  "extraTimeHomeScore": null,
  "extraTimeAwayScore": null
}
```

---

## POST /api/v1/admin/matches/{id}/knockout-result

Submit official result for a knockout-stage match. Includes full validation of qualifying team and penalty winner consistency.

### Request

```json
{
  "homeScore": 1,
  "awayScore": 1,
  "qualifyingTeam": "Argentina",
  "penaltyWinner": "Argentina",
  "extraTimeHomeScore": 1,
  "extraTimeAwayScore": 1
}
```

---

# Admin Scoring API

## POST /api/v1/admin/scores/recalculate/{matchId}

Re-score all predictions for a specific SCORED match and rebuild the leaderboard.

---

## POST /api/v1/admin/scores/recalculate/all

Re-score all predictions for every SCORED match and rebuild the full leaderboard.

---

## GET /api/v1/admin/rankings

Returns the full leaderboard (admin view, no pagination).

---

## GET /api/v1/admin/rankings/top/{n}

Returns the top N ranked users.

---

## GET /api/v1/admin/rankings/stats

Returns aggregate ranking statistics (total users, total predictions, etc.).

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

| HTTP Status | Meaning                                   |
| ----------- | ----------------------------------------- |
| 400         | Validation error / bad request            |
| 401         | Unauthenticated (invalid or missing JWT)  |
| 403         | Forbidden (insufficient role)             |
| 404         | Resource not found                        |
| 409         | Conflict (prediction locked)              |
| 500         | Internal server error                     |

---

# Validation Rules

## Prediction Validation

* match must exist
* prediction must be unique per user (upsert on POST, targeted update on PUT)
* prediction must not be locked
* scores must be >= 0
* knockout matches require penalty winner

## Match Status Transitions

Valid transitions only:

```
SCHEDULED → LOCKED → FINISHED → SCORED
```

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

All other `/api/v1/` endpoints require a valid JWT Bearer token.

---

## Admin Endpoints

Require `ROLE_ADMIN`. Prefix: `/api/v1/admin/`.

---

# Future API Considerations

Potential future endpoints:

* notifications
* statistics dashboards
* matchday rankings
* websocket live updates

Out of scope for v1.
