# SSSPay 💰

A **production-grade fintech wallet & payment system** with manual WhatsApp payment flow and a full admin panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Realtime | Socket.io |
| Auth | JWT + bcrypt |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone & configure

```bash
# Enter server directory
cd server
cp .env.example .env
```

Edit `.env` and fill in:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ssspay
JWT_SECRET=your_random_secret_here
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=Admin@1234
CLIENT_URL=http://localhost:5173
```

### 2. Install & seed backend

```bash
cd server
npm install
node utils/seed.js      # Creates admin account + default settings
npm run dev             # Starts API on http://localhost:5000
```

### 3. Install & start frontend

```bash
cd client
npm install
npm run dev             # Starts UI on http://localhost:5173
```

### 4. Login

| Role | Phone | Password |
|---|---|---|
| Admin | `9999999999` | `Admin@1234` |

> ⚠️ Change these in production via Admin → Settings

---

## Project Structure

```
ssspay/
├── server/
│   ├── config/           # DB connection, constants
│   ├── controllers/      # Business logic (auth, order, admin, ...)
│   ├── middleware/        # JWT auth, adminOnly, rate limiter, validator
│   ├── models/           # Mongoose schemas (User, Order, Transaction, UPI, Notice, Settings)
│   ├── routes/           # Express routers
│   ├── sockets/          # Socket.io handlers + manager singleton
│   ├── utils/            # JWT helper, response helper, order utils, seed script
│   └── server.js         # Entry point
│
└── client/
    └── src/
        ├── components/   # UI components (GlassCard, BalanceCard, Modal, ...)
        ├── context/      # AuthContext, SocketContext, SettingsContext
        ├── hooks/        # useApi, useCountdown, useCopyToClipboard
        ├── layouts/      # UserLayout (bottom nav), AdminLayout (sidebar), AuthLayout
        ├── pages/        # 9 user pages + 7 admin pages
        └── services/     # Axios API wrappers
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register (status = pending) |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/dashboard` | ✅ | Balance, rewards, team count |
| GET | `/api/auth/profile` | ✅ | Full profile |
| PUT | `/api/auth/change-password` | ✅ | Change password |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | ✅ | Create order → WhatsApp URL |
| GET | `/api/orders` | ✅ | My orders (paginated) |
| GET | `/api/orders/transactions` | ✅ | My transactions |
| GET | `/api/orders/team` | ✅ | Referral team + earnings |
| GET | `/api/orders/:id` | ✅ | Single order detail |

### UPI / Notices / Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upi` | ✅ | Submit UPI (once only) |
| GET | `/api/upi` | ✅ | Get my UPI status |
| GET | `/api/notices` | ✅ | Active notices (popup + list) |
| GET | `/api/settings` | — | Public app settings |

### Admin (all require admin JWT)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/analytics` | Dashboard stats + 7-day trend |
| GET/PUT | `/api/admin/users` | List users, filter by status |
| GET | `/api/admin/users/:id` | User detail with UPI, orders, tx |
| PUT | `/api/admin/users/:id/status` | Approve / disable |
| PUT | `/api/admin/users/:id/freeze` | Toggle freeze |
| PUT | `/api/admin/users/:id/reset-password` | Reset password |
| PUT | `/api/admin/users/:id/balance` | Add / deduct balance |
| GET | `/api/admin/orders` | All orders with filters |
| PUT | `/api/admin/orders/:id/approve` | Approve → credit balance + reward |
| PUT | `/api/admin/orders/:id/reject` | Reject order |
| GET/PUT | `/api/admin/upis/:id/status` | Manage UPI statuses |
| GET/POST/PUT/DELETE | `/api/admin/notices` | CRUD notices |
| GET/PUT | `/api/admin/settings` | App-wide settings |
| GET | `/api/admin/export/users` | CSV export |
| GET | `/api/admin/export/orders` | CSV export |

---

## Business Logic

### Order Flow
```
User enters amount (min ₹100)
    ↓
Create order (status: processing)
    ↓
Pick random WhatsApp number from Settings
    ↓
Return WhatsApp URL with pre-filled message
    ↓
User sends payment via WhatsApp
    ↓
Admin approves in admin panel
    ↓
balance += amount
reward  += amount × 2.5%
if referral: referrer.balance += amount × 0.3%
Socket.io events emitted to user instantly
```

### Reward System
| Event | Rate | Recipient |
|---|---|---|
| Deposit approved | 2.5% of amount | Depositing user |
| Referral deposit | 0.3% of amount | Referrer |

### User Statuses
| Status | Can Login | Description |
|---|---|---|
| `pending` | ❌ | Awaiting admin approval |
| `active` | ✅ | Normal access |
| `disabled` | ❌ | Blocked by admin |
| `isFrozen` | ✅ login, ❌ orders | Can see balance, cannot create orders |

---

## Realtime Events (Socket.io)

| Event | Emitted when | Payload |
|---|---|---|
| `balanceUpdated` | Order approved / balance adjusted | `{ balance, reward }` |
| `orderUpdated` | Order approved or rejected | `{ orderId, status, amount }` |
| `notification` | Various triggers | `{ type, message }` |

Frontend auto-subscribes in `SocketContext` and shows toast notifications.

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=7d

# Admin seed
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=Admin@1234

# CORS
CLIENT_URL=http://localhost:5173
```

---

## Production Deployment

### Backend (e.g. Railway / Render)
```bash
cd server
npm install
npm start
```
Set `NODE_ENV=production` and all env vars in your hosting dashboard.

### Frontend (e.g. Vercel / Netlify)
```bash
cd client
npm install
npm run build
# deploy the /dist folder
```

Update `VITE_API_URL` or vite proxy for production API URL.

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add your server IP to Network Access whitelist
3. Copy connection string to `MONGO_URI`

---

## Post-Setup Checklist

- [ ] Change admin phone + password in `.env` and re-seed
- [ ] Add real WhatsApp numbers in Admin → Settings
- [ ] Set correct USDT rate in Admin → Settings  
- [ ] Add Telegram support link in Admin → Settings
- [ ] Post a welcome notice in Admin → Notices
- [ ] Test a full order flow end-to-end

---

## Security Features

- JWT tokens with 7-day expiry
- bcrypt password hashing (12 salt rounds)
- Rate limiting: 10 login attempts / 15 min per IP
- Order rate limit: 20 requests / hour per IP
- IP address + device info stored on register/login
- Admin-only routes double-checked with role middleware
- Input validation on every endpoint via `express-validator`
- Mongoose schema-level validation as second line of defense

---

Built with ❤️ — SSSPay v1.0.0
