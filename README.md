# Mini POS System

A microservices-based Point of Sale (POS) system built with Node.js/Express backend services and an Angular frontend, demonstrating clean architecture, inter-service communication.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Configuration](#environment-configuration)
- [Database Seeding](#database-seeding)
- [Event-Driven Features](#event-driven-features)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

**Mini POS** is a complete point-of-sale application designed to showcase modern microservices architecture. The system allows restaurant staff to:

- View and select available tables
- Browse menu items with real-time stock levels
- Place orders for selected tables
- View order summaries with totals
- Automatically update inventory when orders are placed

---

## 🏗️ Architecture

The project follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐
│  Angular Client │  (Port 4200)
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │  (Port 8000)
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────┐
    ▼         ▼            ▼          ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│  Menu  │ │Table │ │ Orders  │ │ Firebase │
│Service │ │Service│ │ Service │ │Firestore │
│  8001  │ │ 8002 │ │  8003   │ │          │
└────────┘ └──────┘ └─────────┘ └──────────┘
```

### Service Responsibilities

| Service           | Port | Purpose                                            |
| ----------------- | ---- | -------------------------------------------------- |
| **Gateway**       | 8000 | Routes requests, handles CORS, proxies to services |
| **Menu Service**  | 8001 | Manages menu items, pricing, stock                 |
| **Table Service** | 8002 | Manages restaurant tables and their status         |
| **Order Service** | 8003 | Handles order creation and retrieval               |

---

## ✨ Features

### Backend

- **Clean Microservices**: Each service has controllers, repositories, routes, and event publishers
- **Firebase Integration**: Firestore for persistent storage across all services
- **Event-Driven Architecture**: Services publish events on create/update/delete operations
- **Stock Management**: Automatic stock decrement when orders are placed
- **CORS Handling**: Robust preflight and origin handling for secure cross-origin requests
- **API Gateway**: Single entry point with intelligent request proxying
- **Data Seeding**: Quick setup scripts to populate initial data

### Frontend

- **Angular 21**: Modern, reactive UI with TypeScript
- **ng-bootstrap**: Clean, responsive Bootstrap components
- **Service Layer**: Type-safe API communication with HttpClient
- **State Management**: Simple order store using RxJS BehaviorSubjects
- **Routing**: Four-page workflow (Tables → Menu → Order → Summary)
- **Real-time Updates**: Reactive data streams for dynamic UI updates

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.x
- **Database**: Firebase Firestore
- **Message Queue**: RabbitMQ (amqplib) for event distribution
- **Proxy**: express-http-proxy
- **Dev Tools**: nodemon

### Frontend

- **Framework**: Angular 21
- **UI Library**: ng-bootstrap
- **HTTP Client**: Angular HttpClient
- **State**: RxJS BehaviorSubjects
- **Styling**: Bootstrap 5

---

## 📁 Project Structure

```
mini-pos/
├── backend/
│   ├── gateway/                  # API Gateway (Port 8000)
│   │   ├── index.js              # Gateway entry, proxy config
│   │   └── package.json
│   ├── services/
│   │   ├── menu/                 # Menu Service (Port 8001)
│   │   │   ├── src/
│   │   │   │   ├── app.js        # Express app, routes
│   │   │   │   ├── server.js     # Server entry
│   │   │   │   ├── controllers/  # Request handlers
│   │   │   │   ├── repositories/ # Firestore data access
│   │   │   │   ├── routes/       # REST endpoints
│   │   │   │   ├── events/       # Event publisher
│   │   │   │   ├── constants/    # Event types
│   │   │   │   ├── firebase/     # Firebase admin init
│   │   │   │   └── seed/         # Data seeders
│   │   │   └── package.json
│   │   ├── table/                # Table Service (Port 8002)
│   │   │   └── src/              # (same structure as menu)
│   │   └── order/                # Order Service (Port 8003)
│   │       └── src/              # (same structure as menu)
│   └── shared/
│       └── firebase/
│           └── firebase-key.json # Firebase service account key
├── client/                       # Angular Frontend (Port 4200)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/            # Tables, Menu, Order, Summary
│   │   │   ├── services/         # API services
│   │   │   ├── store/            # Order state management
│   │   │   ├── app.routes.ts     # Routing config
│   │   │   └── app.component.ts
│   │   └── environments/         # API base URL config
│   └── package.json
└── README.md
```

---

## 📦 Prerequisites

Before running the project, ensure you have:

- **Node.js** ≥ 18.x (with npm)
- **Angular CLI** (install globally: `npm install -g @angular/cli`)
- **Firebase Project** with Firestore enabled
- **Firebase Service Account Key** (JSON file)
- **Git** (for cloning)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RanaUsman3131/mini-pos.git
cd mini-pos
```

### 2. Set Up Firebase

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** in your project
3. Generate a **Service Account Key**:
   - Go to **Project Settings → Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file as `backend/shared/firebase/firebase-key.json`

### 3. Install Dependencies

#### Backend Services

```bash
# Gateway
cd backend/gateway
npm install

# Menu Service
cd ../services/menu
npm install

# Table Service
cd ../table
npm install

# Order Service
cd ../order
npm install
```

#### Frontend

```bash
cd ../../../client
npm install
```

### 4. Seed the Database

Populate Firestore with initial data:

```bash
# Seed menu items
cd backend/services/menu
node src/seed/seedMenu.js

# Seed tables
cd ../table
node src/seed/seedTables.js
```

### 5. Start All Services

Open **4 terminal windows** and run:

**Terminal 1 - Gateway:**

```bash
cd backend/gateway
npm run dev
```

**Terminal 2 - Menu Service:**

```bash
cd backend/services/menu
npm run dev
```

**Terminal 3 - Table Service:**

```bash
cd backend/services/table
npm run dev
```

**Terminal 4 - Order Service:**

```bash
cd backend/services/order
npm run dev
```

### 6. Start the Angular Client

In a **5th terminal**:

```bash
cd client
npm start
```

The app will open at **http://localhost:4200**

---

## 📡 API Documentation

### Gateway Endpoints (Port 8000)

All frontend requests go through the gateway, which proxies to the appropriate service.

#### Menu Service (`/menu`)

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/menu`        | List all menu items  |
| GET    | `/menu/:id`    | Get single menu item |
| POST   | `/menu`        | Create menu item     |
| PUT    | `/menu/:id`    | Update menu item     |
| DELETE | `/menu/:id`    | Delete menu item     |
| GET    | `/menu/health` | Health check         |

**Example Request:**

```bash
curl -X GET http://localhost:8000/menu
```

**Example Response:**

```json
[
  {
    "id": "abc123",
    "name": "Burger",
    "price": 5.99,
    "category": "Food",
    "stock": 50,
    "available": true
  }
]
```

#### Table Service (`/table`)

| Method | Endpoint        | Description                 |
| ------ | --------------- | --------------------------- |
| GET    | `/table`        | List all tables             |
| GET    | `/table/:id`    | Get single table            |
| POST   | `/table`        | Create table                |
| PUT    | `/table/:id`    | Update table (e.g., status) |
| DELETE | `/table/:id`    | Delete table                |
| GET    | `/table/health` | Health check                |

**Example Request:**

```bash
curl -X GET http://localhost:8000/table
```

**Example Response:**

```json
[
  {
    "id": "table1",
    "name": "Table 1",
    "seats": 4,
    "status": "available"
  }
]
```

#### Order Service (`/orders`)

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/orders`        | Create new order  |
| GET    | `/orders/:id`    | Get order details |
| GET    | `/orders`        | List all orders   |
| GET    | `/orders/health` | Health check      |

**Example Create Order Request:**

```bash
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "table1",
    "items": [
      { "menuItemId": "abc123", "qty": 2 }
    ]
  }'
```

**Example Response:**

```json
{
  "id": "order456",
  "tableId": "table1",
  "items": [
    {
      "menuItemId": "abc123",
      "name": "Burger",
      "price": 5.99,
      "qty": 2
    }
  ],
  "total": 11.98,
  "createdAt": "2025-12-13T10:30:00Z"
}
```

---

## ⚙️ Environment Configuration

### Backend Services

Each service uses the shared Firebase key. No `.env` file needed unless you want to customize ports.

**Optional: Custom Ports**

Create a `.env` file in each service directory:

```env
# backend/services/menu/.env
PORT=8001

# backend/services/table/.env
PORT=8002

# backend/services/order/.env
PORT=8003
```

### Frontend

Configure API base URL in `client/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBase: "http://localhost:8000",
};
```

For production builds, update `environment.prod.ts` with your deployed gateway URL.

---

## 🌱 Database Seeding

Each service includes seed scripts to quickly populate Firestore:

### Menu Items

```bash
cd backend/services/menu
node src/seed/seedMenu.js
```

**Default items:**

- Burger ($5.99, stock: 50)
- Pizza ($8.99, stock: 30)
- Cola ($1.99, stock: 100)

### Tables

```bash
cd backend/services/table
node src/seed/seedTables.js
```

**Default tables:**

- Table 1 (4 seats, available)
- Table 2 (2 seats, available)
- Table 3 (6 seats, occupied)

---

## 🔔 Event-Driven Features

### Stock Decrement on Order Placement

When an order is placed via the Order Service:

1. **Order Service** publishes an `ORDER_PLACED` event
2. **Menu Service** subscribes to this event
3. Stock is atomically decremented for each item in the order
4. Negative stock is prevented (minimum 0)

**Event Payload Example:**

```json
{
  "orderId": "order456",
  "items": [{ "menuItemId": "abc123", "qty": 2 }]
}
```

**Implementation:**

- `backend/services/menu/src/events/event.subscriber.js` handles `ORDER_PLACED`
- `backend/services/menu/src/repositories/menu.repo.js` contains `decrementStockForOrder()`

---

## 🧑‍💻 Development

### Running Individual Services

Start only the services you need:

```bash
# Menu
cd backend/services/menu && npm run dev

# Table
cd backend/services/table && npm run dev

# Orders
cd backend/services/order && npm run dev

# Gateway (required for frontend)
cd backend/gateway && npm run dev
```

### Angular Development

```bash
cd client
npm start
```

**Live reload:** Changes to `.ts` and `.html` files trigger automatic browser refresh.

### Testing API Directly

Use `curl` or Postman to test backend endpoints:

```bash
# Health checks
curl http://localhost:8000/menu/health
curl http://localhost:8000/table/health
curl http://localhost:8000/orders/health

# Get all menu items
curl http://localhost:8000/menu

# Create an order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"tableId":"table1","items":[{"menuItemId":"abc123","qty":1}]}'
```

---

## 🐛 Troubleshooting

### CORS Errors

**Symptom:** Browser blocks requests with "CORS policy" error.

**Solution:**

- Ensure all services are running (`npm run dev` in each directory)
- Verify gateway proxy targets match actual service ports (check `backend/gateway/index.js`)
- Confirm `corsOptions` in each service allows `http://localhost:4200`
- Check browser console for exact blocked URL

### Service Won't Start

**Symptom:** `EADDRINUSE` or port already in use.

**Solution:**

```bash
# Find process on port (e.g., 8000)
lsof -ti:8000 | xargs kill -9

# Or use a different port in .env
```

### Firebase Errors

**Symptom:** `PERMISSION_DENIED` or `credential-admin.initializeApp()` error.

**Solution:**

- Verify `backend/shared/firebase/firebase-key.json` exists and is valid JSON
- Check Firestore rules allow read/write (start with test mode rules)
- Ensure the service account has Firestore permissions

### Angular Build Errors

**Symptom:** `ng serve` fails with module errors.

**Solution:**

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Gateway Not Proxying

**Symptom:** 503 Service Unavailable from gateway.

**Solution:**

- Check all backend services are running
- Verify proxy URLs in `backend/gateway/index.js` match service ports:
  ```javascript
  app.use("/menu", proxy("http://localhost:8001", proxyOptions));
  app.use("/table", proxy("http://localhost:8002", proxyOptions));
  app.use("/orders", proxy("http://localhost:8003", proxyOptions));
  ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

**Project Maintainer:** Rana Usman  
**GitHub:** [@RanaUsman3131](https://github.com/RanaUsman3131)  
**Repository:** [mini-pos](https://github.com/RanaUsman3131/mini-pos)

---

## 🎉 Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/RanaUsman3131/mini-pos.git
cd mini-pos

# 2. Add Firebase key
# Place firebase-key.json in backend/shared/firebase/

# 3. Install all dependencies
cd backend/gateway && npm install
cd ../services/menu && npm install
cd ../table && npm install
cd ../order && npm install
cd ../../../client && npm install

# 4. Seed data
cd backend/services/menu && node src/seed/seedMenu.js
cd ../table && node src/seed/seedTables.js

# 5. Start services (in separate terminals)
cd backend/gateway && npm run dev
cd backend/services/menu && npm run dev
cd backend/services/table && npm run dev
cd backend/services/order && npm run dev
cd client && npm start

# 6. Open browser
# http://localhost:4200
```

---

**Happy Coding! 🚀**
