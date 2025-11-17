# Printo Field Expense Tracker

A full-stack Progressive Web App (PWA) built on the MERN stack for field sales teams to capture, manage, and audit daily expenses — even while offline. Users can submit expenses with receipts and optional GPS coordinates, while accountants review, approve, analyze, and export reports.

## Tech Stack
- **Frontend:** React (Vite, JavaScript), TailwindCSS, Redux Toolkit, React Router, React-Toastify, Recharts
- **Backend:** Node.js, Express, Mongoose, Joi validation, Cloudinary for receipt storage
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcryptjs
- **PWA:** Service Worker, Background Sync, Manifest, Offline caching via IndexedDB
- **Exports:** XLSX, PDFKit for Excel/PDF reports

## Features
- ✅ JWT authentication with role-based guards (`user`, `admin`)
- ✅ Expense CRUD with receipt uploads and optional geolocation capture
- ✅ Offline-first submission queue using IndexedDB + background sync
- ✅ Responsive Tailwind UI with toasts, spinners, and mobile navigation
- ✅ Admin dashboard filters, pagination, and approval workflow
- ✅ Recharts analytics (category, salesman, timeline)
- ✅ One-click Excel/PDF exports and summarized reports
- ✅ Hardened Express backend (Helmet, CORS, rate limiting, validation)
- ✅ PWA manifest + install prompt compatibility

## Project Structure
```
Marketing Team Expense Tracker/
├── client/               # React PWA
│   ├── public/           # static assets, service worker, manifest
│   └── src/
│       ├── components/   # UI components & dashboards
│       ├── pages/        # route-driven screens
│       ├── store/        # Redux slices & store config
│       ├── services/     # API wrapper
│       ├── utils/        # helpers (images, offline queue)
│       └── serviceWorker.js
└── server/               # Express REST API
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── models/
    │   ├── middleware/
    │   ├── config/
    │   └── utils/
    └── index.js
```

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas cluster
- Cloudinary account (image upload)
- Optional: Render (backend) & Vercel (frontend) accounts for deployment

## Environment Variables
Copy `.env.example` to `.env` (root or respective folders) and fill in your secrets.

```bash
# server/.env
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# client/.env
VITE_API_URL=http://localhost:5000/api
```

> When deploying, set `CLIENT_URL` to your Vercel domain and `VITE_API_URL` to the Render API base.

## Getting Started Locally
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run backend (http://localhost:5000)
cd server && npm run dev

# Run frontend (http://localhost:5173)
cd ../client && npm run dev
```

The PWA registers its service worker in production builds. To test offline locally:
1. Run `npm run build` inside `client` and `npm run preview` to serve the static build.
2. Visit the preview URL, install the app (browser install prompt), then toggle offline mode.
3. Create expenses offline; they queue via IndexedDB and sync automatically once connectivity is restored.

## API Overview
| Method | Route | Description | Protected |
|--------|--------------------------|-------------------------------|-----------|
| POST   | `/api/auth/register`     | Register a salesman account   | Public    |
| POST   | `/api/auth/login`        | Login + JWT issuance          | Public    |
| GET    | `/api/auth/profile`      | Fetch authenticated profile   | Auth      |
| POST   | `/api/expenses`          | Create expense (multipart)    | User      |
| GET    | `/api/expenses`          | List user expenses w/ filters | User      |
| PUT    | `/api/expenses/:id`      | Update pending expense        | User      |
| DELETE | `/api/expenses/:id`      | Delete pending expense        | User      |
| GET    | `/api/admin/expenses`    | Admin expense list + filters  | Admin     |
| PUT    | `/api/admin/expenses/:id`| Approve/Reject                | Admin     |
| GET    | `/api/admin/reports`     | Analytics JSON / XLSX / PDF   | Admin     |
| GET    | `/api/admin/salesmen`    | Salesman directory            | Admin     |

## Deployment
### Backend (Render)
1. Push `server/` to a repo and create a Render Web Service.
2. Set build command `npm install` and start command `npm start`.
3. Configure environment variables (same as local `.env`).
4. Enable automatic deploys from your main branch.

### Frontend (Vercel)
1. Push `client/` to a repo (or same monorepo with root path `client`).
2. In Vercel project settings, set framework to `Vite` and output directory `dist`.
3. Add `VITE_API_URL` pointing to your Render deployment.
4. After deployment, confirm the PWA manifests and install prompt from Chrome devtools.

## Testing Checklist
- Login/register flows and protected routes
- Expense submission with/without receipts
- Offline queueing, background sync, and removal
- Admin filters, approvals, and export downloads
- Charts re-render under different filters
- Mobile navigation drawer toggle

## Useful Commands
```bash
# server
npm run dev        # nodemon dev server
npm start          # production server

# client
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # preview production build
```

## License
This project is provided for internal Printo use. Adapt licensing as needed for production deployments.
