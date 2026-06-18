# Enterprise Multi-Vendor E-Commerce Platform

This repository contains a production-grade, enterprise-level, highly scalable, and fault-tolerant multi-vendor e-commerce platform built using a **Microservices Architecture** with **Node.js (TypeScript)**, **Express.js**, **MongoDB**, **Redis**, **RabbitMQ**, and an **Angular Standalone** frontend.

---

## 🛠️ Tech Stack & Architecture

### Backend Services
* **Language/Runtime:** Node.js (TypeScript) & Express.js
* **Database:** MongoDB (using Mongoose for schema modeling, sharding, and compound indexing)
* **Caching Layer:** Redis (used for sliding-window rate limiting, cache-aside product catalog, and sub-millisecond cart storage)
* **Event Broker:** RabbitMQ (topic exchange topology executing Choreography-based Saga transactions)
* **Security:** JWT authentication, Refresh Token Rotation (RTR), role-based access control (RBAC), Helmet security headers, CORS, and Joi input validation.

### Frontend Client
* **Framework:** Angular 18+ (Standalone Components & Lazy Loading)
* **State Management:** Reactive Angular Signals
* **HTTP layer:** Functional interceptors injecting correlation IDs (`x-correlation-id`) and JWT authorization bearer headers.

---

## 🗄️ Microservices Port Mapping

| Service Name | Port | Primary Database | Key Functions |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `3000` | Redis (Rate Limiting) | Reverse Proxy, token validation, rate-limiting |
| **Identity Service** | `3002` | MongoDB (`ecommerce_user_db`) | User registration, login, JWT Refresh Token Rotation |
| **User Service** | `3001` | MongoDB (`ecommerce_user_db`) | Profile management, hierarchical address books |
| **Product Service** | `3003` | MongoDB (`ecommerce_product_db`) | Catalog management, Redis cache-aside queries |
| **Order Service** | `3004` | MongoDB (`ecommerce_order_db`) | Order lifecycle management, Saga checkout orchestrator |
| **Payment Service** | `3005` | MongoDB (`ecommerce_payment_db`) | Stripe processing simulation, payment event hooks |
| **Inventory Service** | `3006` | MongoDB (`ecommerce_inventory_db`)| Atomic stock reservations, compensating lock releases |
| **Cart Service** | `3007` | Redis (TTL Cart keys) | High-speed active cart operations |
| **Notification Service**| `3008`| N/A | Worker printing emails/receipts based on RabbitMQ events |

---

## 🔄 Saga Transaction Flow (Checkout)

When a customer initiates checkout:
1. **Order Service** writes a `PENDING_PAYMENT` order and publishes `order.created`.
2. **Inventory Service** consumes the event and atomically reserves items in stock.
   - If successful, it publishes `inventory.reserved`.
   - If stockout, it publishes `inventory.reservation_failed`.
3. **Payment Service** consumes the `inventory.reserved` event, interacts with the credit card processor (Stripe), and logs transaction outcomes:
   - If paid, it publishes `payment.completed`.
   - If charge fails, it publishes `payment.failed`.
4. **Order Service** consumes the payment completion/failure events:
   - On `payment.completed` -> Sets order status to `PROCESSING` and clears the customer's cart.
   - On `payment.failed` / `inventory.reservation_failed` -> Sets order status to `CANCELLED` and publishes `order.failed` compensation event.
5. **Inventory Service** consumes `order.failed` to release the reserved stock (compensating transaction).

---

## 🚀 Local Deployment Setup

Ensure you have [Docker](https://www.docker.com/) installed on your machine.

### 1. Build and Run Container Orchestrator
Execute the following command in the workspace root directory:
```bash
docker-compose up --build
```
This command compiles the TypeScript code across all microservices, builds lightweight multi-stage Alpine Docker images, and spins up:
* MongoDB
* Redis
* RabbitMQ (Management console accessible at `http://localhost:15672` with credentials `guest/guest`)
* Nginx proxy on Port `80`
* All 9 backend microservice runtimes

### 2. Run Angular Frontend
Navigate to the `frontend/` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:4200` to interact with the premium dark-themed storefront.

---

## 📡 Core API Routes (via API Gateway)

### 🔑 Authentication (`http://localhost:3000/api/v1/auth`)
* `POST /register` - Register a new customer/seller
* `POST /login` - Login and get Access Token & HTTP-only Refresh Token
* `POST /refresh-token` - Rotate refresh token & issue new access token
* `POST /logout` - Clear user session

### 👤 Profile (`http://localhost:3000/api/v1/users`)
* `GET /profile` - Retrieve authenticated profile
* `PATCH /profile` - Update profile details
* `GET /addresses` - List addresses in user address book
* `POST /addresses` - Add new address card

### 📦 Product Catalog (`http://localhost:3000/api/v1/products`)
* `GET /` - List paginated, filtered, and cached products
* `GET /:id` - Retrieve product details
* `POST /` - Add new product (Sellers/Admins)
* `PATCH /:id` - Modify product attributes (Sellers/Admins)
* `DELETE /:id` - Soft delete product (Sellers/Admins)

### 🛒 Shopping Cart (`http://localhost:3000/api/v1/cart`)
* `GET /` - Retrieve cart details
* `POST /add` - Add item to cart
* `PATCH /update-quantity` - Modify item quantity
* `POST /remove` - Delete item from cart

### 💳 Checkout & Orders (`http://localhost:3000/api/v1/orders`)
* `POST /` - Place order (requires `X-Idempotency-Key` header)
* `GET /my-orders` - List purchase history
* `GET /:id` - Fetch order status and tracking logs
