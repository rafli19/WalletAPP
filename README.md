# 💰 WalletApp

A web-based Digital Wallet Management System built with **Laravel** (Backend REST API) and **React.js** (Frontend SPA).

## ✨ Features

- Top Up balance with admin approval flow
- Transfer balance between users
- Transaction & mutation history
- Role-based access: **User** and **Admin**
- Admin panel: manage users (CRUD) and approve/reject top ups
- JWT Authentication using Laravel Sanctum

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, Sanctum |
| Frontend | React.js, Vite |
| Database | MySQL |
| Styling | CSS (custom) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL

---

## ⚙️ Backend Setup (Laravel)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/walletapi.git
cd walletapi

# 2. Install dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wallet_app
DB_USERNAME=root
DB_PASSWORD=

# 6. Run migrations
php artisan migrate

# 7. Create storage symlink (for avatar uploads)
php artisan storage:link

# 8. Start the development server
php artisan serve
```

The API will run at `http://localhost:8000`

---

## 🖥️ Frontend Setup (React)

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

# 5. Start the development server
npm run dev
```

The app will run at `http://localhost:5173`

---

## 🌐 Production Deployment

### Backend
```bash
# Set environment to production in .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.com

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend
```bash
# Build for production
npm run build

# Upload the dist/ folder to your hosting public directory
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/topup` | Request top up |
| POST | `/api/transfer` | Transfer balance |
| GET | `/api/transactions` | Get transaction history |
| PUT | `/api/profile` | Update profile |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/topups` | Get all top up requests |
| POST | `/api/admin/topups/{id}/approve` | Approve top up |
| POST | `/api/admin/topups/{id}/reject` | Reject top up |
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Delete user |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **User** | Register, login, top up, transfer, view transactions, edit profile |
| **Admin** | Approve/reject top ups, manage all users, view top up history |

> To create an admin account, manually set `role = 'admin'` in the `users` table via phpMyAdmin or Tinker:
> ```bash
> php artisan tinker --execute="App\Models\User::where('email', 'admin@mail.com')->update(['role' => 'admin']);"
> ```

---

## 📁 Project Structure

```
walletapi/          # Laravel Backend
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   └── WalletController.php
│   └── Models/
│       ├── User.php
│       └── Transaction.php
├── routes/
│   └── api.php
└── database/migrations/

walletapp/          # React Frontend
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Topup.jsx
│   │   ├── Transfer.jsx
│   │   ├── Transactions.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminTopups.jsx
│   │   └── AdminUsers.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   └── services/
│       └── api.js
```

---

## 📄 License

This project is built for educational purposes as part of the Dibimbing.id Final Project.
