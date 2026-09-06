````markdown
# E-Commerce Platform (Java Migration)

A full-stack e-commerce platform migrated from FastAPI to **Java Spring Boot**, featuring product browsing, shopping cart, wishlist, secure authentication, order management, admin dashboard, MongoDB, OpenSearch, and Dockerized deployment.

## Features

### Customer

* User Registration & Login (JWT Authentication)

* Browse & Search Products

* Product Details

* Wishlist

* Shopping Cart

* Secure Checkout

* Order Success & Order History

### Admin

* Admin Login

* Dashboard Overview

* Order Management

* Update Order Status

* Product Search

* Revenue & Sales Overview

## Tech Stack

### Frontend

* Vue 3

* Vite

* Pinia

* Axios

* Vue Router

### Backend

* Java

* Spring Boot

* Maven

* Spring Security

* JWT Authentication

* BCrypt

* REST API

### Database & Search

* MongoDB

* OpenSearch

### DevOps

* Docker

* Docker Compose

* Nginx

### Testing

* Playwright

## Project Structure

```text
frontend-vue/          # Vue frontend

backend-java/          # Java Spring Boot backend

docker-compose.yml     # Docker Compose configuration

mongo-init.js          # MongoDB initialization

mongo-rs-init.sh       # MongoDB replica-set initialization
````

## Getting Started

### Prerequisites

* Docker

* Docker Compose

* Node.js (optional for frontend development)

* Java 21 (optional for backend development)

* Maven (optional for backend development)

### Run with Docker

```bash
docker compose up -d
```

Frontend:

```text
http://localhost:3000
```

Admin Login:

```text
http://localhost:3000/admin/login
```

Admin Dashboard:

```text
http://localhost:3000/admin/dashboard
```

Backend:

```text
http://localhost:8083
```

MongoDB:

```text
mongodb://localhost:27017
```

OpenSearch:

```text
http://localhost:9200
```

## Admin Credentials

```text
Email: admin@example.com
Password: adminpass
```

## Main Functionalities

* JWT Authentication

* Role-Based Admin Authentication

* Product Catalog

* Search & Filtering

* Wishlist

* Shopping Cart

* Checkout

* Order Management

* Order History

* Admin Dashboard

* Order Status Updates

* Revenue & Sales Overview

* OpenSearch Integration

## API Modules

* Authentication

* Products

* Orders

* Search

* Admin

* Dashboard

## Testing

Playwright tests are included for end-to-end application testing.

Run:

```bash
npx playwright test
```

## Docker

Build:

```bash
docker compose build
```

Run:

```bash
docker compose up -d
```

Rebuild and Run:

```bash
docker compose up -d --build
```

Check Containers:

```bash
docker compose ps
```

View Logs:

```bash
docker compose logs
```

Stop:

```bash
docker compose down
```

## Docker Services

The complete application runs through Docker Compose:

* Vue Frontend — Port 3000

* Java Spring Boot Backend — Port 8083

* MongoDB — Port 27017

* OpenSearch — Port 9200

All services are connected through the Docker network and can be started together using:

```bash
docker compose up -d
```

Existing MongoDB product data is persisted using Docker volumes.

## Future Enhancements

* Payment Gateway Integration

* Email Notifications

* Product Reviews & Ratings

* Inventory Analytics

* Sales Reports

## Contributors

Developed as part of an academic full-stack e-commerce migration project, replacing the previous FastAPI backend with Java Spring Boot while preserving the original application functionality.

## License

This project is intended for educational and academic purposes.

```
```
