# World Cup 2026 Prediction App - Game Rules

## Overview

This application allows registered users to predict the results of World Cup 2026 matches and compete on a global leaderboard based on prediction accuracy.

Users are created by administrators. Public registration is not available in v1.

---

# Competition Format

The competition includes:

* Group Stage matches
* Knockout Stage matches

Knockout stages become available in the application when officially defined.

Supported knockout rounds:

* Round of 16
* Quarter-finals
* Semi-finals
* Third-place match
* Final

---

# Prediction Rules

## General Rules

* Users can submit one prediction per match.
* Users can edit their predictions until 12 hours before match kickoff.
* Once the prediction window closes, predictions become locked.
* Locked predictions cannot be modified.

All dates and match times must be stored and processed in UTC.

---

# Match Result Rules

## Group Stage Matches

Users predict:

* Home team goals
* Away team goals

Example:

* Argentina 2 - 1 Brazil

Only regular-time score is considered for group-stage matches.

---

# Knockout Stage Matches

Users predict:

* Final result including extra time and penalties if applicable.

The application will evaluate the officially qualified winner of the match.

Example:

* Match result after extra time:
  Argentina 2 - 1 Brazil

Example:

* Match tied after extra time and decided by penalties:
  Argentina 1 - 1 Brazil
  Winner: Argentina (penalties)

The system must support storing:

* regular time result
* extra time result (optional)
* penalty winner (optional)

The final qualified team determines the winner evaluation.

---

# Point System

## Exact Score Prediction

Users receive:

* 3 points for predicting the exact final score.

Examples:

| Actual Result | User Prediction | Points |
| ------------- | --------------- | ------ |
| 2-1           | 2-1             | 3      |
| 0-0           | 0-0             | 3      |

---

## Correct Winner or Draw

Users receive:

* 1 point for correctly predicting:

  * winning team
  * or draw result

Examples:

| Actual Result | User Prediction | Points |
| ------------- | --------------- | ------ |
| 2-1           | 1-0             | 1      |
| 3-0           | 2-0             | 1      |
| 1-1           | 0-0             | 1      |

---

## Incorrect Prediction

Users receive:

* 0 points for incorrect predictions.

Examples:

| Actual Result | User Prediction | Points |
| ------------- | --------------- | ------ |
| 2-1           | 0-1             | 0      |
| 1-1           | 2-1             | 0      |

---

# Knockout Match Winner Rules

For knockout matches:

* Predicting the qualified team correctly grants:

  * 1 point if exact score is not correct.
* Predicting the exact final result grants:

  * 3 points.

Penalty shootouts determine the qualified team when applicable.

Example:

| Official Result                | User Prediction                | Points |
| ------------------------------ | ------------------------------ | ------ |
| 1-1 (Argentina wins penalties) | 0-0 (Argentina wins penalties) | 1      |
| 1-1 (Argentina wins penalties) | 1-1 (Argentina wins penalties) | 3      |

---

# Leaderboard Rules

The application includes a global standings table.

The standings page must:

* display all players
* display total accumulated points
* support pagination
* highlight the logged-in user's position
* sort users by highest score first

Potential future enhancements:

* tie-breakers
* matchday standings
* knockout-only standings

These are out of scope for v1.

---

# Match Visibility

The application must include pages for:

## Group Stage

* Matches grouped by tournament groups
* Match dates and kickoff times
* Prediction status

## Knockout Stage

* Bracket or stage-based visualization
* Qualified teams
* Match progression

Knockout view becomes available when official matches are defined.

---

# User Roles

## User

Can:

* login
* submit predictions
* edit predictions before lock
* view leaderboard
* view matches and standings

Cannot:

* manage users
* manage match results

---

## Admin

Can:

* create users
* manage matches
* publish final match results
* trigger score calculations
* manage knockout progression

---

# Match Lifecycle

Each match follows this lifecycle:

SCHEDULED
→ LOCKED
→ FINISHED
→ SCORED

## Definitions

### SCHEDULED

Predictions are open.

### LOCKED

Prediction window closed (12 hours before kickoff).

### FINISHED

Official result entered by admin.

### SCORED

Prediction points calculated and leaderboard updated.

---

# Scoring Rules

Scores should be recalculated whenever:

* match result changes
* penalty result changes
* knockout winner changes

Leaderboard must remain consistent after recalculation.

---

# Out of Scope (v1)

The following features are NOT included in v1:

* Public registration
* Social features
* Notifications
* Real-time updates
* Bonus questions
* Statistics dashboards
* Mobile application
* External API integrations
* Multiple tournaments support

---

# Technical Notes

## Timezone Handling

* Store all timestamps in UTC.
* Convert to local timezone on frontend display only.

## Prediction Lock Logic

Predictions lock automatically:

* 12 hours before official kickoff time.

This validation must exist:

* on backend
* not only on frontend

---

# Future Considerations

Potential future features:

* tie-breaker system
* multiple leagues/groups
* invite links
* private competitions
* matchday scoring
* statistics and analytics
* live score synchronization
* push notifications
