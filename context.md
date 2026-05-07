# Context — FIFA World Cup 2026 Prediction Platform

## 🎯 Project Purpose
A full-stack prediction platform allowing registered users to forecast FIFA World Cup 2026 match outcomes, compete on a global leaderboard, and track cumulative scores. The system emphasizes accuracy, fairness, and a clean, responsive UI.

## 📦 Scope (v1 MVP)
**In Scope:**
- Admin-created user accounts & JWT authentication
- Match listing (Group & Knockout stages)
- Prediction submission & editing (before lock)
- Admin result entry & automatic scoring engine
- Global leaderboard with pagination & current user highlight
- Responsive UI with shadcn/ui & Tailwind CSS

**Out of Scope (v1):**
- Public registration, social features, push notifications
- Real-time live updates, bonus questions, statistics dashboards
- Mobile app, FIFA API integration, multiple tournaments

## 👥 Target Users
| Role    | Capabilities                                                                 |
|---------|------------------------------------------------------------------------------|
| `USER`  | Login, submit/edit predictions, view matches & leaderboard, track personal stats |
| `ADMIN` | Create/manage users, manage matches & results, trigger scoring, manage progression |

## 🛠️ Tech Stack
| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Frontend    | React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod |
| Backend     | Spring Boot 3+, Spring Security, JWT, Spring Data MongoDB, Jakarta Validation |
| Database    | MongoDB 7+ (Document store for Users, Matches, Predictions)                |
| Infra       | Docker Compose, Vercel/Netlify (FE), Render/Railway/AWS (BE), MongoDB Atlas |

## 🔑 Key Domain Concepts
- **Users**: Authenticated accounts (`USER`/`ADMIN`). Created manually by admins.
- **Matches**: Group & Knockout stages with lifecycle: `SCHEDULED → LOCKED → FINISHED → SCORED`.
- **Predictions**: One per user per match. Editable until 12 hours before kickoff.
- **Rankings**: Accumulated points based on scoring rules. Paginated global table.

## ⚠️ Constraints & Assumptions
- All timestamps stored & processed in **UTC**. Local timezone conversion only on frontend.
- Prediction lock is **backend-enforced** (frontend validation is UX-only).
- Scoring recalculates automatically when match results or penalty winners change.
- Leaderboard uses dynamic aggregation or materialized `RankingEntry` depending on scale.
- Admin-only user creation for v1. No public sign-ups.
### Leaderboard Scalability Strategy
v1 leaderboard generation should use dynamic MongoDB aggregation.
If leaderboard scale becomes a performance issue in the future:
* rankings may become materialized/cached
* recalculated asynchronously after score updates
Premature optimization should be avoided in v1.

## 🗺️ Development Phases
1. **Foundation**: Monorepo, Docker, CORS, auth scaffolding (✅ Done)
2. **Authentication**: Login, JWT, role guards, admin routes (✅ Done)
3. **Match Management**: CRUD, grouping, status lifecycle, remote sync (✅ Done)
4. **Predictions**: Submit, edit, lock logic, history (⏳ Next)
5. **Result Processing**: Admin result entry, scoring engine, leaderboard generation
6. **Rankings**: Paginated table, tie handling, current user highlight
7. **Polish**: Loading/empty states, validation, responsive UI, error boundaries

## Realtime Policy
v1 does NOT use:
- WebSockets
- SSE
- live synchronization

Data refresh is request-based using TanStack Query invalidation/refetching.