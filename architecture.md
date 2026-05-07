# Architecture — FIFA World Cup 2026 Prediction Platform

## 🏗️ High-Level Architecture
[Browser] → Vite/React/TS → shadcn/ui → TanStack Query → Axios/fetch
↓
[Spring Boot] → Spring Security (JWT) → MongoDB (MongoRepository/Template)
↓
[Admin UI]  → Manual result entry & scoring triggers


## 📦 Component Breakdown

### Frontend
- **Runtime**: Vite + React 18 + TypeScript (strict mode)
- **State**: 
  - Server state: `@tanstack/react-query` (caching, optimistic updates, pagination)
  - Client state: React Context (auth, theme, UI toggles)
- **Forms**: `react-hook-form` + `zod` for schema validation & type safety
- **UI**: `tailwindcss` + `shadcn/ui` (button, card, table, dialog, form, input)
- **Routing**: `react-router-dom` (protected routes, role-based guards)
- **Validation**: Zod schemas mirror backend DTOs; shared via `shared/` or generated types
### Feature Ownership Structure
Frontend code follows feature-based ownership.
Each feature owns:
* pages
* components
* hooks
* API services
* schemas
* types

Example:

```text
/features/predictions
  /api
  /components
  /hooks
  /schemas
  /types
```

Avoid large global folders with mixed ownership.
Prefer localized feature organization.

### Backend
- **Framework**: Spring Boot 3.x (Java 17+)
- **Security**: Spring Security + JWT (short-lived access + refresh tokens)
- **Persistence**: Spring Data MongoDB (`MongoRepository`, `MongoTemplate` for aggregation)
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, custom validators)
- **API**: RESTful endpoints returning standardized `{ data, error }` envelopes
- **Error Handling**: `@ControllerAdvice` with structured error responses
- **Logging**: SLF4J + Logback (structured, trace IDs for distributed debugging)

### Backend Service Responsibilities
Services should remain focused and separated by business responsibility.
Suggested service structure:

* MatchService
* PredictionService
* ScoringService
* RankingService
* AuthService

Avoid large "god services" containing unrelated responsibilities.
Controllers should remain thin and delegate all business logic to services.

### Database (MongoDB)
| Collection    | Purpose                  | Key Indexes                                  |
|---------------|--------------------------|----------------------------------------------|
| `users`       | Auth & profiles          | `username` (unique), `role`                  |
| `matches`     | Tournament data          | `kickoffAt`, `stage`, `status`               |
| `predictions` | User forecasts           | `userId` + `matchId` (unique), `matchId`, `userId` |
| `rankings`    | Leaderboard aggregation  | `totalPoints` (desc), `position`             |

## 🔄 Data Flow & Key Patterns

### Authentication Flow
1. User submits credentials → `/api/auth/login`
2. Backend validates → issues `access_token` (15m) + `refresh_token` (7d)
3. Frontend stores in `httpOnly` cookies or secure memory
4. Axios interceptor attaches `Authorization: Bearer <token>`
5. Refresh flow handles expiration silently

### Prediction Lifecycle
SCHEDULED (Predictions open)
↓ 12h before kickoff
LOCKED (Submit/edit disabled)
↓ Match ends
FINISHED (Admin enters result)
↓ Scoring engine runs
SCORED (Points calculated, leaderboard updated)

### Scoring Engine
- **Exact Score**: `3 pts`
- **Correct Winner/Draw**: `1 pt`
- **Incorrect**: `0 pts`
- Triggered on `POST /api/v1/admin/matches/{id}/result` or manual score trigger
- Handles extra time/penalties for knockout stages
- Recalculates affected predictions & updates `RankingEntry`

### Leaderboard Generation
- Dynamic aggregation via MongoDB `$group` + `$sum` + `$sort`
- Pagination via `page`/`size` query params
- Highlights current user position via `/api/v1/rankings/me`

## 🌐 API Design Principles
- Base URL: `/api`
- Response envelope: `{ data: T | null, error: Error | null }`
- Pagination: `{ content, page, size, totalElements }`
- Errors: `{ timestamp, status, error, message, path }`
- Role enforcement: `@PreAuthorize("hasRole('ADMIN')")` on admin endpoints
- CORS: Strictly configured for dev (`localhost:5173`) & prod domains

## 🚀 Deployment & Infra
| Service     | Stack/Platform          | Notes                                  |
|-------------|-------------------------|----------------------------------------|
| Frontend    | Vercel / Netlify        | Static build, env vars for API URL     |
| Backend     | Render / Railway / AWS  | Java 17 JAR, MongoDB URI, CORS config  |
| Database    | MongoDB Atlas           | Replica set, backup, indexing          |
| CI/CD       | GitHub Actions          | Lint → Test → Build → Deploy           |
| Monitoring  | Prometheus/Grafana or ELK | Health checks, error rates, latency  |
