# 💰 WalletApp — Frontend

Frontend SPA for WalletApp Digital Wallet Management System, built with **React.js** and **Vite**.

## ✨ Features

- User dashboard with balance info
- Top Up saldo via QRIS, M-Banking, VA, E-Wallet
- Transfer balance to other users
- Transaction & mutation history
- Edit profile & avatar upload
- Separate Admin panel (dashboard, top up approval, user management)
- Role-based routing (User & Admin)

---

## 🧱 Tech Stack

| | |
|---|---|
| Framework | React.js |
| Build Tool | Vite |
| HTTP Client | Axios |
| Routing | React Router DOM |
| Styling | CSS (custom) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/walletapp.git
cd walletapp

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Set the API base URL in .env
VITE_API_BASE_URL=http://localhost:8000/api

# 5. Start development server
npm run dev
```

App will run at `http://localhost:5173`

> Make sure the backend (WalletAPI) is running before starting the frontend.

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Topup.jsx
│   ├── Transfer.jsx
│   ├── Transactions.jsx
│   ├── Profile.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminTopups.jsx
│   └── AdminUsers.jsx
├── components/
│   ├── Layout.jsx
│   ├── AdminLayout.jsx
│   ├── Sidebar.jsx
│   ├── AdminSidebar.jsx
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── services/
│   └── api.js
├── hooks/
│   └── useToast.js
└── App.jsx
```

---

## 👥 User Roles & Routing

| Role | Routes |
|------|--------|
| **User** | `/dashboard`, `/topup`, `/transfer`, `/transactions`, `/profile` |
| **Admin** | `/admin`, `/admin/topups`, `/admin/users` |

After login, users are automatically redirected based on their role.

---

## 🏗️ Production Build

```bash
# Build for production
npm run build

# Preview the build locally
npm run preview
```

Upload the generated `dist/` folder to your hosting public directory.

---

## 🔗 Related Repository

- Backend (Laravel): [WalletAPI](https://github.com/your-username/walletapi)

---

## 📄 License

Built for educational purposes — Dibimbing.id Final Project.
