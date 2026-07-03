# 🥛 Doodh Ledger — Full-Stack MERN SaaS

> A production-ready household expense tracker for milk, water, and gas.
> Built with React 19 + Vite (PWA) on the frontend and Node/Express/MongoDB on the backend.

---

## 📁 Project Structure

```
doodh-ledger/
├── backend/
│   ├── config/         db.js
│   ├── controllers/    authController, milkController, waterController,
│   │                   gasController, dashboardController, billController,
│   │                   supplierController, notificationController, analyticsController
│   ├── middleware/     auth.js (JWT protect + authorize), errorHandler.js
│   ├── models/         User, Supplier, MilkEntry, WaterEntry, GasEntry, Bill, Notification
│   ├── routes/         authRoutes, milkRoutes, waterRoutes, gasRoutes,
│   │                   dashboardRoutes, billRoutes, supplierRoutes,
│   │                   notificationRoutes, analyticsRoutes, userRoutes
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── public/         manifest.webmanifest, icon-192.svg, icon-512.svg
│   └── src/
│       ├── api/        axios.js (interceptors + token handling)
│       ├── context/    AuthContext.jsx, NotifContext.jsx
│       ├── layouts/    AppLayout.jsx (sidebar + topbar)
│       ├── pages/      Landing, Login, Signup, Dashboard, MilkRecords,
│       │               WaterRecords, GasRecords, Suppliers, Billing,
│       │               Reports, Profile, Settings
│       ├── components/ MilkModal, WaterModal, GasModal, SummaryCard,
│       │               ConfirmModal, NotificationsPanel
│       ├── utils/      helpers.js (formatCurrency, downloadCSV, formatDate …)
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css   (Glassmorphism dark theme + CSS variables)
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or Atlas URI)

### 1. Clone & install
```bash
git clone https://github.com/yourname/doodh-ledger.git
cd doodh-ledger

# Backend
cd backend && cp .env.example .env && npm install

# Frontend
cd ../frontend && cp .env.example .env && npm install
```

### 2. Configure `.env` (backend)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/doodh-ledger
JWT_SECRET=your_super_secret_32_char_minimum_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
```

### 3. Run
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## 🐳 Docker Deployment (Production)

```bash
# 1. Set your JWT secret
export JWT_SECRET="your_super_secret_production_key_min_32_chars"
export FRONTEND_URL="https://yourdomain.com"

# 2. Start all services
docker-compose up -d --build

# App runs on http://localhost (port 80)
# API on http://localhost:5000
```

---

## ☁️ Cloud Deployment

### Render.com (free tier)
1. Push to GitHub
2. Create **Web Service** → point to `/backend`, build cmd `npm install`, start cmd `node server.js`
3. Add all env vars in Render dashboard
4. Create **Static Site** → point to `/frontend`, build cmd `npm run build`, publish dir `dist`

### Railway
```bash
railway init
railway add  # add MongoDB plugin
railway up
```

### VPS (Ubuntu)
```bash
sudo apt update && sudo apt install -y nginx nodejs npm
cd /var/www && git clone <repo>
cd doodh-ledger && docker-compose up -d
# Configure nginx reverse proxy to port 80
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/auth/signup` | `{name, email, password, phone}` | Register |
| POST | `/auth/login` | `{email, password}` | Login → returns JWT |
| GET | `/auth/logout` | — | Clear cookie |
| GET | `/auth/me` | — | Get profile |
| PUT | `/auth/profile` | `{name, phone, address, currency, darkMode}` | Update profile |
| PUT | `/auth/password` | `{currentPassword, newPassword}` | Change password |

### Suppliers
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/suppliers?type=milk` | List (filter by type: milk/water/gas) |
| POST | `/suppliers` | Create |
| PUT | `/suppliers/:id` | Update |
| DELETE | `/suppliers/:id` | Delete |

### Milk
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/milk?month=1&year=2025` | List entries |
| POST | `/milk` | Create entry |
| PUT | `/milk/:id` | Update |
| DELETE | `/milk/:id` | Delete |
| GET | `/milk/summary?month=1&year=2025` | Monthly totals |
| GET | `/milk/trend` | 6-month trend |

**Milk entry body:**
```json
{
  "date": "2025-01-15",
  "morningQty": 1.5,
  "eveningQty": 1.0,
  "fatPercent": 3.5,
  "ratePerLiter": 120,
  "supplier": "<supplierId>",
  "notes": "Fresh delivery"
}
```

### Water
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/water?month=1&year=2025` | List entries |
| POST | `/water` | Create |
| PUT | `/water/:id` | Update |
| DELETE | `/water/:id` | Delete |
| GET | `/water/summary?month=1&year=2025` | Monthly totals |
| GET | `/water/trend` | 6-month trend |

**Water entry body:**
```json
{
  "date": "2025-01-10",
  "numberOfCans": 2,
  "ratePerCan": 150,
  "supplier": "<supplierId>",
  "notes": ""
}
```

### Gas
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/gas?month=1&year=2025` | List entries |
| POST | `/gas` | Create (auto-calculates days used + next refill) |
| PUT | `/gas/:id` | Update |
| DELETE | `/gas/:id` | Delete |
| GET | `/gas/summary?month=1&year=2025` | Summary + avg duration |

**Gas entry body:**
```json
{
  "deliveryDate": "2025-01-05",
  "cylinderCost": 2800,
  "cylinderType": "medium",
  "supplier": "<supplierId>",
  "notes": ""
}
```
`cylinderType`: `small | medium | large | commercial`

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Full dashboard data (cards + trends + recent) |

### Billing
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/bills` | All bills |
| POST | `/bills` | Generate bill `{month, year}` |
| DELETE | `/bills/:id` | Delete bill |
| PATCH | `/bills/:id` | Update status `{status: "paid"}` |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/yearly?year=2025` | Full year breakdown by month |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | Get all (last 20) |
| PUT | `/notifications/mark-read` | Mark all read |
| DELETE | `/notifications/:id` | Delete one |

---

## 🗃️ MongoDB Schemas

### User
```
name, email, password (bcrypt), role (user/admin),
phone, address, avatar, currency, darkMode,
notifications: { cylinderReminder, waterReminder, monthlyBill },
isActive, lastLogin, timestamps
```

### Supplier
```
user (ref), name, type (milk/water/gas),
phone, address, notes, isActive, timestamps
```

### MilkEntry
```
user (ref), supplier (ref), date, morningQty, eveningQty,
fatPercent, ratePerLiter, notes,
totalQty (computed), totalAmount (computed), timestamps
```

### WaterEntry
```
user (ref), supplier (ref), date,
numberOfCans, ratePerCan, notes,
totalAmount (computed), timestamps
```

### GasEntry
```
user (ref), supplier (ref), deliveryDate,
cylinderCost, cylinderType, notes,
daysUsed, nextRefillDate, timestamps
```

### Bill
```
user (ref), billNumber (auto), month, year,
milkSupplier, waterSupplier, gasSupplier,
milkLiters, milkCharges, waterCans, waterCharges,
gasCylinders, gasCharges,
grandTotal (computed), status (draft/generated/paid), timestamps
```

### Notification
```
user (ref), title, message,
type (gas_reminder/water_reminder/bill_ready/info/warning),
isRead, link, timestamps
```

---

## 🔐 Authentication Flow

1. User signs up → password bcrypt-hashed → JWT issued (7d) → stored in `localStorage` + httpOnly cookie
2. All API calls send `Authorization: Bearer <token>` header
3. `protect` middleware verifies JWT, fetches user from DB
4. `authorize(...roles)` middleware checks role for admin routes
5. On 401 response, Axios interceptor clears storage and redirects to `/login`

---

## 🎨 Design System

- **Theme:** Glassmorphism dark (default) with light mode toggle
- **Font:** Nunito (Google Fonts)
- **Colors:** CSS variables — `--primary` #4f9cf9, `--secondary` #a855f7, `--accent` #34d399
- **Cards:** `backdrop-filter: blur(20px)` + semi-transparent background + border glow
- **Animations:** fadeIn, slideIn, stagger children

---

## 📱 PWA Features

- ✅ `manifest.webmanifest` with icons
- ✅ Service Worker via `vite-plugin-pwa` (Workbox)
- ✅ Offline caching for static assets
- ✅ NetworkFirst strategy for API calls
- ✅ "Add to Home Screen" installable on iOS, Android, Desktop

---

## 🧪 Testing

```bash
# Backend — test endpoints with curl
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v6 |
| Styling | Bootstrap 5, Custom CSS (Glassmorphism) |
| Charts | Chart.js + react-chartjs-2 |
| Icons | react-icons (Remix Icons) |
| HTTP | Axios with interceptors |
| State | Context API + localStorage |
| PWA | vite-plugin-pwa + Workbox |
| PDF | jsPDF + jsPDF-AutoTable |
| Export | XLSX, CSV (built-in) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs + cookie-parser |
| Security | Helmet, CORS, rate-limiting |
| Deploy | Docker + Nginx + Docker Compose |

---

Made with 🥛 for Pakistani households. © 2025 Doodh Ledger.
