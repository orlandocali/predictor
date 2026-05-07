# api-plan.md

# FIFA World Cup 2026 Prediction App - API Plan

## Overview

This document defines the REST API structure for the application.

Base URL:

```text
/api
```

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

## POST /api/auth/login

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
  "user": {
    "id": "123",
    "username": "orlando",
    "role": "USER"
  }
}
```

---

## GET /api/auth/me

Returns authenticated user profile.

---

# Health API

## GET /api/health

Basic health check endpoint.

### Response

```json
{
  "status": "UP"
}
```

---

# Matches API

## GET /api/matches

Returns all matches.

### Query Parameters

| Parameter | Description      |
| --------- | ---------------- |
| stage     | Filter by stage  |
| status    | Filter by status |
| group     | Filter by group  |

---

## GET /api/matches/{id}

Returns match details.

---

## GET /api/matches/grouped

Returns matches grouped by:

* group stage
* knockout stage

Used for tournament view pages.

---

# Predictions API

## GET /api/predictions/me

Returns logged user predictions.

---

## GET /api/predictions/match/{matchId}

Returns current user prediction for a match.

---

## POST /api/predictions

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

## PUT /api/predictions/{id}

Updates prediction.

Validation:

* prediction must not be locked

---

## DELETE /api/predictions/{id}

Optional endpoint.

Can be omitted in v1.

---

# Rankings API

## GET /api/rankings

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

## GET /api/rankings/me

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

All endpoints require:

```text
ROLE_ADMIN
```

---

# Admin Users API

## POST /api/admin/users

Create user.

---

## GET /api/admin/users

List users.

---

## PUT /api/admin/users/{id}

Update user.

---

## PATCH /api/admin/users/{id}/active

Enable/disable user.

---

# Admin Matches API

## POST /api/admin/matches

Create match.

---

## PUT /api/admin/matches/{id}

Update match.

---

## PATCH /api/admin/matches/{id}/status

Update match status.

---

## POST /api/admin/matches/{id}/result

Publish official result.

### Request

```json
{
  "homeScore": 2,
  "awayScore": 1,
  "penaltyWinner": null
}
```

---

## POST /api/admin/matches/{id}/score

Trigger prediction scoring.

Optional in v1.

Could be automatic after result publishing.

---

# Error Handling

Standard error response:

```json
{
  "timestamp": "2026-01-01T10:00:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Prediction is locked",
  "path": "/api/predictions/123"
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

| Endpoint        |
| --------------- |
| /api/health     |
| /api/auth/login |

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
* tournament import
* websocket live updates

Out of scope for v1.
