# ROADMAP.md

# FIFA World Cup 2026 Prediction App - Development Roadmap

## Project Philosophy

This project prioritizes:

* maintainability
* explicit architecture
* predictable behavior
* AI-agent-friendly development
* incremental delivery

The application should remain:

* simple
* modular
* scalable
* easy to debug

Avoid:

* premature optimization
* unnecessary abstractions
* microservices
* realtime complexity in v1

---

# Current Status

## ✅ Completed

### Foundation

* Monorepo structure
* Docker Compose setup
* Frontend/backend communication
* MongoDB integration
* Tailwind configuration
* shadcn/ui setup
* TanStack Query setup
* Basic auth scaffolding
* CORS configuration
* Environment variable setup
* Initial folder structure
* Health endpoint integration

---

# Phase 2 — Authentication & Authorization

## Goal

Establish secure authenticated application access with role-based protection.

---

## Backend Tasks

### 2.1 JWT Authentication Foundation

* JWT token generation
* JWT validation filter
* Spring Security configuration
* Password encryption
* Authentication endpoints

### 2.2 User Persistence

* User entity/model
* MongoDB repository
* Initial admin seed support

### 2.3 Authorization Rules

* USER role support
* ADMIN role support
* Route protection
* Admin-only endpoint validation

---

## Frontend Tasks

### 2.4 Login Experience

* Login page
* Form validation
* Authentication API integration
* Error handling

### 2.5 Auth State Management

* React Context authentication state
* Token persistence
* Logout flow

### 2.6 Protected Routes

* Authenticated layouts
* Admin route guards
* Redirect handling

---

## Acceptance Criteria

* User can login successfully
* Invalid login returns proper errors
* Protected routes require authentication
* Admin routes are inaccessible to USER role
* JWT validation works correctly
* Session survives page refresh

---

# Phase 3 — Match Management

## Goal

Allow administrators to manage FIFA matches and tournament structure.

---

## Backend Tasks

### 3.1 Match Domain

* Match model
* Match DTOs
* Match repository
* Match service

### 3.2 Admin Match CRUD

* Create match
* Update match
* List matches
* Match filtering
* Match lifecycle support

### 3.3 Match Status Lifecycle

Support:

* SCHEDULED
* LOCKED
* FINISHED
* SCORED

### 3.4 Remote Match Sync (Optional V1.5)

* External FIFA API integration
* Dynamic match updates

This is NOT required for MVP.

---

## Frontend Tasks

### 3.5 Match List UI

* Match cards
* Stage filters
* Group filters
* Date sorting

### 3.6 Tournament View

* Group stage visualization
* Knockout stage visualization
* Match details page

### 3.7 Admin Match Management

* Match creation form
* Match edit form
* Match status controls

---

## Acceptance Criteria

* Admin can create matches
* Matches display correctly grouped
* Match filtering works
* Match lifecycle transitions work
* Knockout stages display correctly

---

# Phase 4 — Predictions

## Goal

Allow users to create and manage predictions.

---

## Backend Tasks

### 4.1 Prediction Domain

* Prediction model
* Prediction DTOs
* Prediction repository
* Prediction service

### 4.2 Prediction Rules

* One prediction per user per match
* Validation rules
* Score validation

### 4.3 Prediction Locking

* Automatic 12-hour lock enforcement
* Backend validation
* Locked prediction handling

---

## Frontend Tasks

### 4.4 Prediction Submission UI

* Prediction forms
* Validation states
* Match prediction cards

### 4.5 Prediction Editing

* Edit prediction flow
* Locked-state UI handling

### 4.6 User Prediction History

* My predictions page
* Prediction status display

---

## Acceptance Criteria

* Users can submit predictions
* Users can edit before lock
* Locked predictions cannot be edited
* Validation errors display correctly
* Prediction history displays correctly

---

# Phase 5 — Result Processing & Scoring

## Goal

Process official results and calculate prediction points.

---

## Backend Tasks

### 5.1 Match Result Management

* Admin result submission
* Penalty winner support
* Extra-time support

### 5.2 Scoring Engine

Implement:

* Exact score = 3 points
* Correct winner/draw = 1 point
* Incorrect prediction = 0 points

### 5.3 Knockout Scoring Logic

Support:

* penalty winner validation
* knockout qualification logic

### 5.4 Score Recalculation

* Recalculate predictions
* Update rankings
* Ensure consistency

---

## Frontend Tasks

### 5.5 Admin Result Entry UI

* Result submission forms
* Match completion workflow

### 5.6 Result Visualization

* Official score display
* User earned points display

---

## Acceptance Criteria

* Admin can publish results
* Prediction scores calculate correctly
* Knockout rules behave correctly
* Rankings update correctly
* Recalculation remains consistent

---

# Phase 6 — Rankings & Leaderboards

## Goal

Provide global standings and ranking visibility.

---

## Backend Tasks

### 6.1 Ranking Aggregation

* Total score calculation
* Position ordering
* Pagination support

### 6.2 Ranking Optimization

* Mongo aggregation pipeline
* Efficient sorting

Avoid materialized rankings in v1.

---

## Frontend Tasks

### 6.3 Leaderboard Page

* Paginated rankings
* User highlighting
* Position display

### 6.4 Logged User Ranking

* Current user position
* Personal score summary

---

## Acceptance Criteria

* Rankings sort correctly
* Pagination works
* User ranking is visible
* Ranking updates after scoring

---

# Phase 7 — Stability & Polish

## Goal

Improve UX quality, resilience, and consistency.

---

## Frontend Tasks

### 7.1 UI Consistency

* shadcn/ui standardization
* spacing cleanup
* responsive behavior

### 7.2 Error Handling

* Error boundaries
* Global API error handling
* Empty states
* Loading states

### 7.3 Validation Improvements

* Form validation consistency
* User-friendly messages

---

## Backend Tasks

### 7.4 API Hardening

* Exception handling
* Validation consistency
* Security review

### 7.5 Logging Improvements

* Structured logs
* Error tracing

---

## Acceptance Criteria

* Responsive UI works well
* Error handling is stable
* Validation is consistent
* APIs return predictable responses

---

# Future Enhancements (Post-MVP)

These are intentionally postponed.

## Possible Features

* Public registration
* Private leagues
* Matchday rankings
* Notifications
* Statistics dashboards
* FIFA API synchronization
* Live updates
* Mobile application
* Multiple tournaments
* Social features

---

# Technical Constraints

## Frontend

* Avoid Redux in v1
* Avoid unnecessary custom hooks
* Prefer explicit readable components

## Backend

* Controllers remain thin
* Business logic belongs in services
* DTOs required at API boundaries

## Database

* MongoDB only
* Avoid premature optimization
* Use indexes intentionally

---

# Development Guidelines

## Preferred Workflow

1. Backend endpoint
2. DTO validation
3. Frontend integration
4. UI polish
5. Tests

---

# Definition of Done

A feature is considered complete when:

* backend implemented
* frontend integrated
* validation exists
* loading/error states handled
* authorization enforced
* manual testing completed
* Docker environment works
* code follows architecture rules
