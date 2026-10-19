# TeamBoard

TeamBoard is a small team task board. People register, create a team, invite others by team id, and keep tasks on that team. A task is visible to its creator, the person it is assigned to, and members of its team.

The first registered account is an admin. Admins can open the full user directory and delete other accounts. Everyone else only sees their own tasks and the teams they belong to.

## Run it

Docker is the one-minute path. From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Open [http://localhost](http://localhost). The API is at [http://localhost:3000](http://localhost:3000).

Replace `JWT_SECRET` in `.env` before you use this anywhere except your own machine. The placeholder is rejected when `NODE_ENV=production`.

To make another account an admin, connect to the database and sign in again:

```bash
docker compose exec db psql -U postgres -d teamboard \
  -c "UPDATE users SET is_admin = true WHERE email = 'you@example.com';"
```

## Local development

Start only the database from Compose, then run the apps on the host. Compose publishes Postgres on port **5433**.

```bash
cp .env.example .env
docker compose up db
cp .env.example backend/.env
```

In `backend/.env` set `DB_HOST=localhost` and `DB_PORT=5433`.

```bash
cd backend && npm ci && npm run dev
cd frontend && npm ci && npm run dev
```

The frontend dev server is [http://localhost:5173](http://localhost:5173). It calls `http://localhost:3000/api/v1` unless `VITE_API_BASE_URL` is set.

## Tests

Backend tests need an empty Postgres database named `teamboard_test`. They refuse to run against any other database name.

```bash
docker run --name teamboard-test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=teamboard_test \
  -p 5432:5432 -d postgres:16-alpine

cd backend && npm test
cd frontend && npm test
```

If port 5432 is already taken, map another host port and pass `DB_PORT` to the backend tests.

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Public. Password is at least 8 characters. |
| POST | `/api/v1/auth/login` | Public. |
| GET | `/api/v1/teams` | Teams you belong to. |
| POST | `/api/v1/teams` | Signed in. You become a member. |
| POST | `/api/v1/teams/:id/join` | Signed in. This is the invite. |
| GET | `/api/v1/teams/:id` | Members and admins. |
| GET | `/api/v1/tasks` | Your tasks and tasks from your teams. |
| GET | `/api/v1/tasks?teamId=` | Members of that team. |
| GET | `/api/v1/tasks?all=true` | Admins. |
| POST, PUT | `/api/v1/tasks` | People who can see the task. |
| DELETE | `/api/v1/tasks/:id` | Creator or admin. |
| GET, DELETE | `/api/v1/users` | Admins. An admin cannot delete their own account. |

`GET /health` is the liveness check. `GET /ready` also checks Postgres.
