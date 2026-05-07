# Coding Rules — FIFA World Cup 2026 Prediction Platform

## 📜 General Principles
- **Explicit over implicit**: Prefer clear types, names, and error handling over magic numbers or implicit conversions.
- **DRY & SOLID**: Extract repeated logic into services/hooks. Keep classes focused (SRP).
- **Fail fast**: Validate inputs early. Return structured errors, not stack traces.
- **UTC everywhere**: Store all timestamps as `Instant`/`UTC`. Convert to local only on render.

## ⚛️ Frontend Rules (React + TS + Vite)
### TypeScript
- Enable `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- Use `interface` for shapes, `type` for unions/intersections
- Avoid `any`; use `unknown` + type guards when necessary

### React & TanStack Query
- Functional components + hooks only. No class components.
- Server state lives in TanStack Query. Client state in `zustand`/Context.
- Use optimistic updates for predictions:
  ```ts
  queryClient.setQueryData(['predictions', matchId], (old) => ({
    ...old,
    data: newPrediction,
  }));
  ```
- Handle loading/error/empty states consistently across features.
- Use react-hook-form + zod for all forms. Schema must match backend DTO.
### UI & Styling
- shadcn/ui components only. No custom CSS unless absolutely necessary.
- Tailwind utility-first. Extract repeated patterns into cn() or components.
- Responsive by default: mobile-first, test at 320px, 768px, 1024px+.
## ☕ Backend Rules (Spring Boot + MongoDB)
### Structure & Layers
controller → service → repository → model (Document)
     ↓          ↓           ↓
   DTO/Req    DTO/Resp   Validation
- Controllers: Thin. Delegate to services. Return DTOs.
- Services: Business logic, transactions, scoring, locking.
- Repositories: Spring Data Mongo. Custom queries in @Query or criteria API.
- DTOs: Separate request/response objects. Never expose entities directly.
### Security & Auth
- JWT filter extends OncePerRequestFilter
- Short-lived access tokens (15m), refresh tokens (7d)
- Passwords hashed with BCryptPasswordEncoder
- Role checks: @PreAuthorize("hasRole('ADMIN')")
- CORS: Explicit origins, no wildcards in prod
### Validation & Errors
- Use Jakarta Validation (@Valid, @NotNull, custom @LockedPrediction)
- Global @ControllerAdvice for consistent error envelopes
- Custom exceptions: PredictionLockedException, MatchNotFoundException, etc.
### MongoDB Practices
- Use @Document(collection = "...") for entities
- Indexes: Compound indexes for frequent queries (userId + matchId)
- Avoid deep nesting; keep documents normalized where possible
- Use Aggregation for leaderboards, not in-memory filtering

## 🛡️ Domain-Specific Rules
### Prediction Locking
- Lock threshold: kickoffAt minus 12 hours
- Backend validation mandatory:
if (now.isAfter(match.getKickoffAt().minusHours(12))) {
  throw new PredictionLockedException("Prediction window closed");
}
- Frontend shows disabled state but backend enforces.
### Scoring Engine
- Immutable once scored. Recalculation only on result change.
- Knockout matches evaluate penaltyWinner if applicable.
- Points awarded per rule: 3 (exact), 1 (correct winner/draw), 0 (incorrect).
### Timezone Handling
- DB: Instant / UTC
- API: ISO 8601 (2026-06-15T14:00:00Z)
- Frontend: date-fns-tz or Intl.DateTimeFormat for display only.

## 🧪 Testing Strategy
Type	Tooling	Coverage Target
Unit	JUnit 5 + Vitest	>80%
Integration	Testcontainers (Mongo)	Core services
E2E	Playwright / Cypress	Auth, predictions, leaderboard
Security	OWASP ZAP / SonarQube	JWT, CORS, input sanitization

## 📝 Git & Workflow
- Branching: feature/<ticket>-<short-desc>, fix/<ticket>-<short-desc>
- Commits: Conventional Commits (feat:, fix:, docs:, refactor:, test:)
- PRs: Required. Checklist includes:
    Tests added/updated
    Backend validation matches frontend
    UTC handling verified
    No hardcoded credentials/keys
    Swagger/Postman updated
- Review: 1+ approvals, CI green, no TODO without ticket link.

## 📈 Performance & Scalability
- TanStack Query: staleTime, gcTime, pagination for large datasets
- MongoDB: Indexes on kickoffAt, status, userId+matchId
- Leaderboard: Materialize RankingEntry if >10k users
- Frontend: Code-split routes, lazy load heavy components, prefetch predictions
- Backend: Connection pooling, async scoring if needed, rate limit prediction endpoints