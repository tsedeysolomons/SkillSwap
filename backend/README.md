# Backend

This folder will contain the SkillSwap backend server.

## Planned Stack
- Node.js + Express (REST API)
- JWT Authentication
- Middleware for auth, validation, error handling

## Planned Structure
`
backend/
+-- src/
¦   +-- controllers/
¦   +-- routes/
¦   +-- middleware/
¦   +-- models/
¦   +-- services/
¦   +-- index.js
+-- package.json
+-- .env.example
`
"@

New-Item -ItemType File -Path "backend\.env.example" -Force | Out-Null
Set-Content "backend\.env.example" @"
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/skillswap
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
