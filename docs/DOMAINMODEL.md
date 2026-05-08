# domain-model.md

# World Cup 2026 Prediction App - Domain Model

## Overview

This document defines the core domain entities, relationships, enums, and business ownership rules for the application.

The application follows a relatively simple domain-driven structure focused on:

* users
* matches
* predictions
* rankings

MongoDB will be used as the persistence layer.

---

# Core Entities

## User

Represents an authenticated application user.

### Fields

| Field       | Type     | Description               |
| ----------- | -------- | ------------------------- |
| id          | String   | MongoDB ObjectId          |
| username    | String   | Unique username           |
| password    | String   | Encrypted password        |
| displayName | String   | User visible name         |
| role        | UserRole | USER or ADMIN             |
| active      | Boolean  | Whether account is active |
| createdAt   | Instant  | Creation timestamp        |
| updatedAt   | Instant  | Last update timestamp     |

---

## UserRole Enum

```text
USER
ADMIN
```

---

# Match

Represents an official World Cup match.

## Fields

| Field       | Type        | Description                       |
| ----------- | ----------- | --------------------------------- |
| id          | String      | MongoDB ObjectId                  |
| externalMatchId | String      | Optional external match identifier |
| homeTeam    | String      | Home team name                    |
| awayTeam    | String      | Away team name                    |
| stage       | MatchStage  | Tournament stage                  |
| groupName   | String      | Group name (A-H) when applicable  |
| kickoffAt   | Instant     | Match kickoff UTC                 |
| status      | MatchStatus | Current match state               |
| venue       | String      | Optional stadium/venue            |
| result      | MatchResult | Official result                   |
| createdAt   | Instant     | Creation timestamp                |
| updatedAt   | Instant     | Last update timestamp             |

Note: `homeTeam` and `awayTeam` are stored as plain strings in v1. The `TeamReference` sub-document is a future enhancement.

---

# MatchStage Enum

```text
GROUP_STAGE
ROUND_OF_16
QUARTER_FINAL
SEMI_FINAL
THIRD_PLACE
FINAL
```

---

# MatchStatus Enum

```text
SCHEDULED
LOCKED
FINISHED
SCORED
```

---

# TeamReference (Future)

A `TeamReference` sub-document (with `code`, `name`, `flagUrl`) is planned but not yet implemented. In v1, teams are stored as plain strings on the `Match` entity.

---

# MatchResult

Represents the official result of a match.

## Fields

| Field         | Type    | Description                           |
| ------------- | ------- | ------------------------------------- |
| homeScore     | Integer | Final home goals                      |
| awayScore     | Integer | Final away goals                      |
| penaltyWinner | String  | Optional — "HOME" or "AWAY"           |

Note: `resultEnteredAt` and `enteredByUserId` audit fields are planned for a future audit-log enhancement.

---

# TeamSide Enum

```text
HOME
AWAY
```

---

# RefreshToken

Represents a persisted refresh token used in the JWT authentication flow.

## Fields

| Field     | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| id        | String  | MongoDB ObjectId                  |
| token     | String  | Opaque refresh token value        |
| userId    | String  | Owning user reference             |
| expiresAt | Instant | Expiry timestamp (7-day TTL)      |

Stored in the `refresh_tokens` collection.

---

# Prediction

Represents a user prediction for a specific match.

## Fields

| Field                  | Type     | Description                    |
| ---------------------- | -------- | ------------------------------ |
| id                     | String   | MongoDB ObjectId               |
| userId                 | String   | User owner                     |
| matchId                | String   | Match reference                |
| predictedHomeScore     | Integer  | Predicted home score           |
| predictedAwayScore     | Integer  | Predicted away score           |
| predictedPenaltyWinner | TeamSide | Optional knockout winner       |
| locked                 | Boolean  | Whether prediction is editable |
| pointsEarned           | Integer  | Calculated score               |
| createdAt              | Instant  | Creation timestamp             |
| updatedAt              | Instant  | Last update timestamp          |

---

# RankingEntry

Represents leaderboard aggregation data.

This entity may eventually become:

* cached
* materialized
* dynamically calculated

For v1 it can be calculated dynamically.

## Fields

| Field                    | Type    |
| ------------------------ | ------- |
| userId                   | String  |
| username                 | String  |
| displayName              | String  |
| totalPoints              | Integer |
| exactPredictions         | Integer |
| correctWinnerPredictions | Integer |
| position                 | Integer |

---

# Relationships

## User → Prediction

One user can have many predictions.

```text
User 1 --- N Prediction
```

---

## Match → Prediction

One match can have many predictions.

```text
Match 1 --- N Prediction
```

---

# Business Ownership Rules

## User Ownership

Users own:

* their predictions

Users cannot modify:

* other users
* match results

---

## Admin Ownership

Admins manage:

* users
* matches
* results
* scoring recalculation

---

# Locking Rules

A prediction becomes locked:

* 12 hours before kickoff

Backend validation is mandatory.

Frontend validation is optional UX support only.

---

# Scoring Rules

## Exact Score

* 3 points

## Correct Winner/Draw

* 1 point

## Incorrect Prediction

* 0 points

---

# MongoDB Collection Suggestions

| Collection     | Purpose                        |
| -------------- | ------------------------------ |
| users          | User accounts                  |
| matches        | Match data                     |
| predictions    | User predictions               |
| refresh_tokens | Persisted JWT refresh tokens   |

---

# Suggested MongoDB Indexes

## users

* username unique

## matches

* kickoffAt
* stage
* status

## predictions

* userId + matchId unique
* matchId
* userId

---

# Future Domain Considerations

Potential future entities:

* Tournament
* League
* BonusQuestion
* Notification
* Invite
* Matchday
* AuditLog

These are out of scope for v1.
