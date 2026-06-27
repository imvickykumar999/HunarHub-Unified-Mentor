# HunarHub – Digital Marketplace for Local Micro-Entrepreneurs

HunarHub is a modern, responsive **MERN-Stack (MongoDB, Express, React, Node.js)** platform designed to digitally empower local micro-entrepreneurs such as potters (kumhar), tailors, artisans, cobblers, and small vendors who possess valuable traditional skills but lack digital visibility. 

By centralizing skill showcasing, physical product sales, and direct service bookings in a single marketplace, HunarHub connects local talent with customers, eliminates middlemen commissions, and fosters sustainable neighborhood economies.

---

## 🚀 Key Features

### 👤 Customer (Buyer) Features
*   **Discover Local Talents:** Filter artisans by skill category (Potter, Cobbler, Tailor, Artisan, Vendor) or neighborhood location.
*   **Direct Service Booking:** Submit customized work requests (e.g. dress resizing, pot restorations) specifying a proposed budget, description, and target date.
*   **Handmade Shop Checkout:** Buy handcrafted items directly from creator inventories with real-time stock deductions.
*   **Ratings & Reviews:** Rate completed services and delivered products, which dynamically updates the entrepreneur's overall rating.

### 🏺 Micro-Entrepreneur Features
*   **Availability Toggle:** Signal to customers if they are busy or active for new service bookings.
*   **Workspace Dashboard:** 
    *   **Manage Bookings:** Review, accept, reject, and complete incoming service requests.
    *   **Manage Product Orders:** Process incoming catalog orders and transition states (Ship & Deliver).
    *   **Storefront Manager (CRUD):** Add, update, and delete catalog listings (name, description, price, stock).
    *   **Earnings Overview:** Track cumulative earnings added automatically upon completing orders and services.
*   **Public Profile Customizer:** Edit business name, biography, skills keywords, experience years, pricing charts, and phone numbers.

### 🛡️ Administrator Features
*   **Creator Verifications:** Audit incoming entrepreneur sign-ups and grant/revoke verification badges.
*   **Real-time Analytics:** Track platform-wide performance metrics, including total sales volume, booking conversion rates, average entrepreneur earnings, and category breakdown.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, React Router DOM (v7), Lucide Icons, Vanilla CSS Design System (Custom properties, dark glassmorphism, responsive grids, transitions).
*   **Backend:** Node.js, Express.js REST API.
*   **Database:** MongoDB database.
*   **Package Managers & Runtimes:** npm, Docker (local container instance).
*   **Authorization:** JWT (JSON Web Tokens), `bcryptjs` password hashing.
*   **Uploads:** Multer multipart image handlers.

---

## 📁 Repository Structure

```
HunarHub/
├── backend/
│   ├── config/          # DB connection configuration
│   ├── middleware/      # JWT route protection & role shields
│   ├── models/          # Mongoose Schemas (User, Profile, Product, Request, Order)
│   ├── routes/          # Express API controllers (auth, profiles, products, requests, orders, admin, uploads)
│   ├── uploads/         # Static storage folder for image uploads
│   ├── index.js         # Entry point for backend Express app
│   ├── seed.js          # Mock data database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout elements (Navbar)
│   │   ├── pages/       # Page views (Home, Login, Register, ProfileDetails, Dashboard)
│   │   ├── utils/       # Centralized Fetch API utility
│   │   ├── App.jsx      # Session controller & Route mapper
│   │   └── index.css    # Core responsive CSS design tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🔧 Getting Started & Setup

### Prerequisites
*   Node.js (v18+) & npm installed.
*   MongoDB running locally on port `27017` (or spin up a Docker container using `docker run -d -p 27017:27017 --name hunarhub-mongo mongo`).

### Step 1: Install Dependencies
Open two terminal windows to set up the client and server:
```bash
# Terminal 1: Install Backend packages
cd backend
npm install

# Terminal 2: Install Frontend packages
cd frontend
npm install
```

### Step 2: Seed the Database
Populate your MongoDB database with pre-configured verified micro-entrepreneurs, product stores, customer accounts, and historical bookings to explore:
```bash
cd backend
node seed.js
```
*   **Default Customer Account:** `rahul@gmail.com` (password: `password123`)
*   **Default Entrepreneur Account:** `ram.kumhar@gmail.com` (password: `password123`)
*   **Default Admin Account:** `admin@hunarhub.com` (password: `password123`)

### Step 3: Run Developers Servers
```bash
# Terminal 1: Start Express Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Start React Client (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` to interact with the platform!

---

## 📌 Deliverables Included
*   **Express Rest Server:** Healthy health-checked REST endpoints with structured JSON responses.
*   **Vite React Web App:** Interactive dashboard and responsive catalog.
*   **Detailed Project Report:** Check [report.md](file:///home/ubuntu/HunarHub/report.md) for a comprehensive study of the system specifications, data models, impact targets, and design choices.
