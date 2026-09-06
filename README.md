# E-Commerce Platform — Java Spring Boot

A full-stack e-commerce platform with a **Java 21 / Spring Boot 3.2** backend, **Vue 3** frontend, **MongoDB** (replica set) database, and **OpenSearch** full-text search. The entire stack runs in Docker Compose with no local runtimes required.



## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite 8, Pinia, Vue Router 5, Axios, Tailwind CSS 3 |
| Backend | Java 21, Spring Boot 3.2.2, Spring Security, JJWT 0.12.5, Lombok |
| Database | MongoDB 7.0 (single-node replica set `rs0`) |
| Search | OpenSearch 2.13.0 (security disabled, single-node) |
| Build | Maven 3.9 (multi-stage Docker build) |
| Serve | Nginx 1.27-alpine (SPA + reverse proxy) |
| E2E Tests | Playwright with Chromium |

---

## Project Structure

```
Ecom_Java/
├── backend-java/               # Spring Boot application
│   ├── src/main/java/com/ecomapi/
│   │   ├── config/             # DatabaseInitializer, OpenSearchConfig, RedisConfig
│   │   ├── controller/         # AuthController, ProductController, OrderController,
│   │   │                       #   SearchController, HealthController
│   │   ├── dto/                # LoginRequest/Response, RegisterRequest, CheckoutRequest, …
│   │   ├── exception/          # GlobalExceptionHandler
│   │   ├── model/              # User, Product, Order, OrderItem, OrderStatus, Address, …
│   │   ├── repository/         # Spring Data MongoDB repositories
│   │   ├── security/           # JwtUtil, JwtAuthFilter, SecurityConfig
│   │   ├── service/            # OrderService, SearchService
│   │   └── worker/             # OrderSyncWorker (scheduled, every 60 s)
│   ├── src/main/resources/
│   │   └── application.yml     # Port 8083, MongoDB/Redis/OpenSearch/JWT config
│   ├── Dockerfile              # Multi-stage: Maven build → JRE 21 runtime
│   └── pom.xml
│
├── frontend-vue/               # Vue 3 single-page application
│   ├── src/
│   │   ├── pages/              # Home, Products, ProductDetail, Search, Cart,
│   │   │                       #   Checkout, Orders, OrderDetail, OrderSuccess,
│   │   │                       #   Wishlist, Login, Register,
│   │   │                       #   AdminLogin, AdminDashboard, AdminOrders,
│   │   │                       #   AdminOrderDetail
│   │   ├── components/         # Layout, AdminLayout, Navbar, Footer, ProductCard, …
│   │   ├── stores/             # Pinia: auth, admin, cart, wishlist
│   │   ├── services/api.js     # Axios instance (base /api, JWT interceptor)
│   │   └── router/index.js     # Vue Router with route guards
│   ├── nginx.docker.conf       # SPA fallback + /api/ proxy to backend
│   └── Dockerfile              # Multi-stage: Node 20 build → Nginx 1.27 serve
│
├── database/
│   ├── mongo-init.js           # Mounted into mongo initdb.d (no-op marker)
│   ├── mongo-rs-init.sh        # Replica-set init (one-shot service)
│   └── mongo-rs-init.js        # rs.initiate() script
│
├── scripts/
│   ├── seed_admin.js           # Creates/refreshes admin@example.com in MongoDB
│   ├── seed_products.js        # Product seeder
│   └── seed_multi_category.js  # Multi-category product seeder (335 products)
│
├── tests/                      # Playwright E2E specs
│   ├── admin.spec.ts
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   ├── storefront.spec.ts
│   └── toasts.spec.ts
│
├── docker-compose.yml
├── playwright.config.js
└── package.json                # Root: Playwright dev dependency + test scripts
```

---

## Docker Services

Defined in `docker-compose.yml` with project name `ecom-java`:

| Container | Image | Host Port | Role |
|---|---|---|---|
| `ecom-java-mongo` | `mongo:7.0` | 27017 | MongoDB replica set primary (`rs0`) |
| `ecom-java-mongo-init` | `mongo:7.0` | — | One-shot replica set initializer (exits 0) |
| `ecom-java-opensearch` | `opensearchproject/opensearch:2.13.0` | 9200, 9600 | Full-text search (security disabled) |
| `ecom-java-backend` | built from `./backend-java` | 8083 | Spring Boot REST API |
| `ecom-java-frontend` | built from `./frontend-vue` | 3000 | Nginx — Vue SPA + API proxy |

**Startup order:** `mongo` → `mongo-init` (completes) → `opensearch` (healthy) → `backend` (healthy) → `frontend`

**Volumes:**
- `ecom-java-mongo-data` — **external**, pre-created with the 335 seeded products (do not delete)
- `ecom-java-opensearch-data` — managed by Docker

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Compose V2

That's it. Java, Maven, and Node.js are only needed for local development outside Docker.

### First-time setup (external volume required)

The MongoDB volume is marked `external: true` because it contains the pre-seeded product catalog. Create it once before the first `up`:

```powershell
docker volume create ecom-java-mongo-data
```

If you need to seed the admin user (first run or after a volume wipe):

```powershell
cd scripts
npm install
node seed_admin.js
```

### Run the full stack

```powershell
docker compose -p ecom-java up -d
```

### Rebuild images and restart

```powershell
docker compose -p ecom-java up -d --build
```

### Check container health

```powershell
docker compose -p ecom-java ps
```

### View logs

```powershell
# All services
docker compose -p ecom-java logs -f

# Single service
docker compose -p ecom-java logs -f ecom-java-backend
```

### Stop

```powershell
docker compose -p ecom-java down
```

> Do **not** use `docker compose down -v` — that deletes the `ecom-java-mongo-data` volume and all product data.

---

## URLs

| Service | URL |
|---|---|
| Storefront | http://localhost:3000 |
| Admin Login | http://localhost:3000/admin/login |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Backend API | http://localhost:8083 |
| Health check | http://localhost:8083/health |
| MongoDB | mongodb://localhost:27017 |
| OpenSearch | http://localhost:9200 |

---

## Admin Credentials

```
Email:    admin@example.com
Password: adminpass
```

---

## API Reference

All endpoints are prefixed with `/api`. JWT tokens are passed as `Authorization: Bearer <token>` and expire after **24 hours**.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new customer |
| POST | `/api/auth/login` | Public | Customer login → JWT |
| POST | `/api/auth/admin/login` | Public | Admin login → JWT (requires `ADMIN` role) |

### Products — `/api/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List products (pagination, filtering, sorting) |
| GET | `/api/products/{id}` | Public | Get a single product |
| GET | `/api/products/categories` | Public | List distinct primary categories |
| GET | `/api/products/categories/hierarchy` | Public | Full category/sub-category tree |

Query params for `GET /api/products`: `page` (1-based), `limit` (1–100), `category`, `primaryCategory`, `subCategory`, `department`, `search`, `sort` (`price_asc`, `price_desc`, `rating_desc`).

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Authenticated | Create an order (supports `Idempotency-Key` header) |
| POST | `/api/orders/checkout` | Authenticated | Legacy checkout endpoint |
| GET | `/api/orders/{id}` | Authenticated | Get a single order |
| GET | `/api/orders/customer/{customerId}` | Authenticated | List orders for a customer |
| PATCH | `/api/orders/{id}/status` | Admin only | Update order status |

### Search — `/api/search`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/search?q=` | Public | Keyword search |
| POST | `/api/search/orders` | Admin only | Full-text order search with filters (used by admin dashboard) |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Docker healthcheck endpoint |
| GET | `/api/health` | Public | API health (used by frontend/tests) |

---

## Security

- Passwords hashed with **BCrypt** (cost factor 11)
- Stateless JWT authentication (no sessions)
- Role-based access: `CUSTOMER` (default) and `ADMIN`
- Admin-only routes: `POST /api/search/orders`, `PATCH /api/orders/{id}/status`
- CORS: all origins permitted (development configuration)

---

## Background Worker

`OrderSyncWorker` runs on a fixed 60-second delay. It queries MongoDB for orders where `syncedToSearch = false`, indexes each one into OpenSearch via `SearchService`, then marks them as synced. Failures are logged and retried on the next cycle.

---

## Data

- **335 products** across 4 primary categories: `Electronics`, `Fashion`, `Home`, `Beauty`
- Each product has: SKU, title, description, category hierarchy, brand, price (minor units/cents), stock, rating, review count, images
- Prices stored as integers in minor currency units (e.g. `30720` = ₹307.20)
- MongoDB runs as a single-node replica set (`rs0`) to support transactions and change streams

---

## Local Development (without Docker)

### Backend

Requirements: Java 21, Maven 3.9, running MongoDB (replica set) and OpenSearch.

```powershell
cd backend-java
mvn spring-boot:run
```

Override connection settings via environment variables or edit `src/main/resources/application.yml`.

### Frontend

Requirements: Node.js 20+

```powershell
cd frontend-vue
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8083` by default. Set `VITE_API_URL` to override.

---

## Testing

### E2E Tests (Playwright)

Tests run against the live stack on `http://localhost:3000`. Start the Docker stack first, then:

```powershell
# Run all tests headless
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Open the HTML report after a run
npm run test:e2e:report
```

Test specs in `tests/`:

| File | Coverage |
|---|---|
| `admin.spec.ts` | Admin login, dashboard KPIs, order search/filters, order detail, status update, logout |
| `auth.spec.ts` | Customer register, login, logout |
| `checkout.spec.ts` | Cart → checkout → order success flow |
| `storefront.spec.ts` | Product listing, filtering, search, product detail |
| `toasts.spec.ts` | Toast notification behaviour |

Playwright is configured for **Chromium only**, with a 30-second timeout, 1 retry, and `trace`/`screenshot`/`video` captured on failure. Reports are written to `playwright-report/`.

### Backend Unit Test

```powershell
cd backend-java
mvn test
```

A single Spring Boot context load test (`EcomApiApplicationTests`) verifies that the application context starts successfully.

---

## Environment Variables

The backend reads these at startup (defaults shown):

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ecommerce` | Full MongoDB connection string |
| `MONGODB_DATABASE` | `ecommerce` | Database name |
| `OPENSEARCH_HOST` | `localhost` | OpenSearch hostname |
| `OPENSEARCH_PORT` | `9200` | OpenSearch port |
| `OPENSEARCH_SCHEME` | `http` | `http` or `https` |
| `JWT_SECRET` | *(dev default)* | HMAC secret — change for production |
| `REDIS_HOST` | `localhost` | Redis host (optional; backend degrades gracefully) |
| `REDIS_PORT` | `6379` | Redis port |

In Docker Compose these are set directly in the `environment:` block of the `ecom-java-backend` service.

---

## License

Educational and academic use.
