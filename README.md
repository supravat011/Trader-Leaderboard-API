🏆 Trader Leaderboard API

A clean REST API to manage trader scores and generate a dynamic leaderboard. Built with Node.js + Express and SQLite (via `better-sqlite3`). Includes optional JWT auth and in-memory caching for fast reads.

✨ Features
- 🎯 RESTful API design with Express.js
- 💾 SQLite database with optimized indexes
- 🔐 JWT authentication (optional)
- ⚡ In-memory caching for leaderboard
- 🏆 Dynamic ranking system
- 📊 Top 10 leaderboard generation
- 🔄 Upsert logic (only updates if score is higher)
- 🛡️ Security headers with Helmet
- 📝 Request logging with Morgan
- 🌐 CORS enabled for cross-origin requests

🚀 Quick Start
1) Install dependencies
```
npm install
```
2) (Optional) Configure environment variables
```
PORT=3000
JWT_SECRET=change-this
DEMO_USERNAME=admin
DEMO_PASSWORD=password
CACHE_TTL_MS=5000
```
3) Run the server
```
npm run start
```
Dev mode with auto-reload:
```
npm run dev
```

Server runs at `http://localhost:3000`. SQLite DB lives at `data/leaderboard.db`.

✅ Health Check
```
GET /health
```
Response: `{ "ok": true }`

🔐 Auth (Bonus)
Get a JWT token:
```
POST /api/login
Content-Type: application/json
{
  "username": "admin",
  "password": "password"
}
```
Response:
```
{ "token": "<JWT>" }
```
Use `Authorization: Bearer <JWT>` for protected routes.

📡 Endpoints
- **POST /api/scores** (protected)
  - Body: `{ "traderName": "Alice", "score": 120 }`
  - Logic: creates trader if missing; updates only if new score is higher
  - Responses:
    - 201 Created: `{ "name": "Alice", "score": 120, "updated": true }`
    - 200 OK (no change): `{ "name": "Alice", "score": 120, "updated": false }`

- **GET /api/leaderboard**
  - Returns Top 10 by score (descending). Cached in-memory for `CACHE_TTL_MS`.
  - Example:
```
[
  { "name": "Alice", "score": 150 },
  { "name": "Bob", "score": 120 }
]
```

- **GET /api/rank/:traderName**
  - Returns current rank (1 = highest) and score
  - Example: `{ "name": "Alice", "score": 150, "rank": 1 }`

🧪 Try It Out (cURL)
```
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | node -pe "JSON.parse(fs.readFileSync(0,'utf8')).token")

curl -X POST http://localhost:3000/api/scores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"traderName":"Alice","score":120}'

curl http://localhost:3000/api/leaderboard
curl http://localhost:3000/api/rank/Alice
```

📝 Notes
- SQLite is persisted under `data/` with WAL mode for reliability.
- Unique index on `name` and sorted index on `score` support fast reads.
- Leaderboard cache auto-invalidates on score create/update.

🛠 Tech Stack
- Express 5, better-sqlite3, helmet, cors, morgan
- JWT via `jsonwebtoken`, password hashing via `bcryptjs`

📄 License
MIT License - feel free to use this project for learning, development, or production use.

🔧 Setup Details
- Node.js 18+ required
- SQLite database auto-created at `data/leaderboard.db`
- WAL mode enabled for better concurrency
- Environment variables supported via `.env` file
- Development mode with nodemon for auto-restart
