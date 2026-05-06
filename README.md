# MapYourNext

**Community-Driven Travel Discovery & Intelligent Planning Platform**

Stack: MongoDB · Express.js · React.js · Node.js + AI Layer

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### 1. Start MongoDB
```bash
# Option A: Docker
docker compose up -d mongo

# Option B: Local MongoDB
mongod --dbpath /data/db

# Option C: MongoDB Atlas — set MONGODB_URI in .env
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other keys
```

### 3. Start Backend
```bash
cd server
npm install
npm run seed    # Seeds categories, destinations, admin user
npm run dev     # Starts on http://localhost:5000
```

### 4. Start Frontend
```bash
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

### Default Admin Login
```
Email: admin@mapyournext.in
Password: Admin@123456
```

---

## Project Structure

```
mapyournext/
├── server/                         # Node.js + Express backend
│   ├── config/                     # DB, JWT, Cloudinary config
│   ├── models/                     # 14 Mongoose models
│   ├── routes/                     # 14 Express routers
│   ├── controllers/                # 8 Route handler files
│   ├── services/                   # AI, Recommendation, Notification
│   ├── middleware/                 # Auth, RBAC, Upload
│   ├── utils/                      # Error handling
│   ├── seed.js                     # Database seeder
│   └── server.js                   # Entry point
├── client/                         # React frontend (Vite)
│   ├── src/
│   │   ├── pages/                  # 7 Route-level pages
│   │   ├── components/             # 6 Reusable components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── store/                  # Redux Toolkit slices
│   │   └── services/               # Axios API client
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Routes (80+)
All routes follow: `{ success: boolean, message: string, data: any }`

| Category | Count | Auth |
|----------|-------|------|
| Auth & Users | 9 | Mix |
| Destinations | 7 | Mix |
| Guides | 7 | Mix |
| Categories | 5 | Mix |
| Reviews | 4 | Mix |
| Communities | 4 | Mix |
| Posts & Comments | 5 | Mix |
| Follows | 4 | Mix |
| Notifications | 2 | Auth |
| Reports | 3 | Auth/Mod |
| Trips | 4 | Auth |
| AI & Recommendations | 4 | Auth |
| Creator Applications | 3 | Mix |

## Tech Stack
- **Backend:** Express.js, Mongoose 8, JWT + bcrypt, Multer + Cloudinary
- **Frontend:** React 18, Vite, Tailwind CSS 3, Redux Toolkit, React Router v6
- **AI:** OpenAI GPT-4o-mini with template fallback
- **Maps:** Leaflet + OpenStreetMap
