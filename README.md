# RateHub — Store Rating Web Application

Full-stack intern coding challenge implementation: React (Vite) frontend, Express.js backend, MySQL database, JWT authentication, and role-based access for **System Administrator**, **Normal User**, and **Store Owner**.

## Prerequisites

- Node.js 18+ and npm
- MySQL 8+ (local server running)
- Git (optional)

## Project structure

```
store-rating-app/
├── backend/          # Express API
├── frontend/         # React + Vite SPA
├── database/
│   ├── schema.sql    # Database + tables
│   └── seed.sql      # Notes (use npm run seed)
├── package.json      # Root convenience scripts
└── README.md
```

## 1. Install dependencies

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. MySQL database setup

Create the database and tables (does **not** drop an existing database):

```bash
mysql -u root -p < database/schema.sql
```

On Windows (PowerShell), if `mysql` is on your PATH:

```powershell
Get-Content database\schema.sql | mysql -u root -p
```

Or open MySQL Workbench / CLI and run the contents of `database/schema.sql`.

## 3. Environment configuration

### Backend

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host (default `localhost`) |
| `DB_PORT` | MySQL port (default `3306`) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | `store_rating_db` |
| `JWT_SECRET` | Long random secret (required) |
| `JWT_EXPIRES_IN` | e.g. `24h` |
| `CORS_ORIGIN` | Frontend origin, e.g. `http://localhost:5173` |
| `PORT` | API port (default `5000`) |

### Frontend

```bash
cd frontend
copy .env.example .env
```

Set `VITE_API_URL=http://localhost:5000/api`.

## 4. Create the first administrator

After the schema is applied and `.env` is configured:

```bash
cd backend
npm run create-admin
```

Uses `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_ADDRESS` from `.env`. Default sample values:

- Email: `admin@example.com`
- Password: `Admin@1234`

## 5. Optional development seed

Inserts sample admin, store owners, users, stores, and ratings (idempotent — safe to re-run):

```bash
cd backend
npm run seed
```

Sample accounts after seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Admin@1234` |
| Store Owner | `owner1@example.com` | `Owner@1234` |
| Store Owner | `owner2@example.com` | `Owner@1234` |
| User | `user1@example.com` | `User@1234` |
| User | `user2@example.com` | `User@1234` |

## 6. Run the application

Terminal 1 — backend:

```bash
cd backend
npm run dev
```

API: `http://localhost:5000`  
Health: `http://localhost:5000/api/health`

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
```

App: `http://localhost:5173`

Production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## 7. How to test all three roles

1. **Admin** — Log in as `admin@example.com`. View dashboard stats, create users/stores, search/sort tables, open user details.
2. **Normal user** — Register a new account (always gets role `user`) or use `user1@example.com`. Browse stores, submit/update ratings, change password, log out.
3. **Store owner** — Log in as `owner1@example.com`. View average rating and list of users who rated the owned store. Change password.

## API overview

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register normal user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/auth/logout` | Auth | Client-side logout notice |
| PUT | `/api/auth/change-password` | Auth | Change password |
| GET | `/api/admin/dashboard` | Admin | Totals |
| GET/POST | `/api/admin/users` | Admin | List / create users |
| GET | `/api/admin/users/:id` | Admin | User details |
| GET/POST | `/api/admin/stores` | Admin | List / create stores |
| GET | `/api/stores` | User (+ admin) | Store list with search |
| POST | `/api/stores/:storeId/ratings` | User | Submit/update rating |
| GET | `/api/owner/dashboard` | Store owner | Owner store + ratings |

All protected routes require `Authorization: Bearer <token>`.

## Validation rules

- **Name:** 20–60 characters  
- **Address:** max 400 characters  
- **Email:** valid format; normalized to lowercase; unique  
- **Password:** 8–16 characters, at least one uppercase, one lowercase, one digit, one special character  
- **Rating:** integer 1–5  
- Public registration always assigns role `user`

## Security notes

- Passwords hashed with bcrypt  
- JWT verified on protected routes  
- Role checks in backend middleware (not UI-only)  
- Parameterized SQL via `mysql2`  
- CORS restricted to configured origin  
- Basic rate limiting on auth and global API  

## Root npm scripts

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
npm run build:frontend
npm run seed
npm run create-admin
npm run check:backend
npm run check:frontend
```
