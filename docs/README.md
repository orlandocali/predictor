# Predictor — FIFA World Cup 2026

Full-stack prediction platform skeleton. React + Spring Boot + MongoDB.

## Prerequisites
- Node.js 20+
- Java 17+
- Maven 3.9+
- Docker Desktop (for Docker Compose)

## Project Structure
```text
predictor/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Spring Boot (Java 17)
├── docs/              # Documentation
├── docker-compose.yml
└── .env.example
```

## Local Development (without Docker)

### Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8081
# Requires MongoDB running on localhost:27017
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### MongoDB (local)
Install MongoDB Community or use Docker just for MongoDB:
```bash
docker run -d -p 27017:27017 --name predictor-mongo mongo:7
```

## Docker Compose (Full Stack)

```bash
# Copy env file
cp .env.example .env

# Build and start all services
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes (clears MongoDB data)
docker compose down -v
```

Services:
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8081 |
| MongoDB | localhost:27017 |
| Swagger UI | http://localhost:8081/swagger-ui.html |

## Environment Variables

### Backend (`backend/src/main/resources/application.yml`)
| Variable | Default | Description |
|---|---|---|
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017/predictor` | MongoDB connection string |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

### Frontend (`frontend/.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8081` | Backend API base URL |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check — returns `{"status":"UP"}` |
| GET | `/api/matches` | List matches (returns empty array for now) |

Full API docs: http://localhost:8081/swagger-ui.html

## Architecture

```text
frontend (React)
    │
    │ HTTP (Axios / TanStack Query)
    ▼
backend (Spring Boot)
    │
    │ Spring Data MongoDB
    ▼
MongoDB
```

### Frontend Structure
```text
src/
├── features/       # Feature modules (auth, matches, predictions, rankings, admin)
├── components/     # Shared UI components
├── services/       # API service functions
├── hooks/          # Custom React hooks
├── layouts/        # Page layout components
├── pages/          # Route-level page components
├── lib/            # Utilities (cn, etc.)
├── types/          # TypeScript interfaces
└── routes/         # React Router config
```

### Backend Structure
```text
src/main/java/com/app/
├── controller/     # REST controllers
├── service/        # Business logic
├── repository/     # MongoDB repositories
├── model/          # MongoDB documents
├── dto/            # Data Transfer Objects
├── mapper/         # DTO mappers
├── config/         # Spring configuration (CORS, Swagger)
├── security/       # Security config, JWT stub
└── exception/      # Global exception handler
```

## Next Steps

Recommended implementation order:

1. **Authentication** — Implement JWT auth flow (`JwtUtil`, `JwtFilter`, `/api/auth/login`, `/api/auth/register`)
2. **User model** — Add `User` document, `UserRepository`, `UserService`
3. **Match CRUD** — Implement match creation and management (admin only)
4. **Prediction logic** — Allow users to submit match predictions
5. **Scoring engine** — Calculate prediction scores after matches
6. **Rankings** — Leaderboard based on cumulative prediction scores
7. **Groups & Knockout** — World Cup bracket structure
8. **UI components** — Install shadcn/ui components (`npx shadcn-ui@latest add button card table`)
9. **Real-time updates** — WebSocket or polling for live match updates

## shadcn/ui Component Installation

```bash
cd frontend

# Install individual components as needed:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

## Troubleshooting

**Backend won't start:** Ensure MongoDB is running. Check `SPRING_DATA_MONGODB_URI`.

**CORS errors:** Ensure `CORS_ALLOWED_ORIGINS` matches your frontend URL exactly.

**Frontend can't reach backend:** Check `VITE_API_URL` in `frontend/.env` and verify backend is running on port 8081.

**Docker build fails:** Ensure Docker Desktop is running. Try `docker compose down -v && docker compose up --build`.
