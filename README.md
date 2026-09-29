# Food Order Management System

A full-stack application for managing restaurant customers, food items,
and orders. The frontend is built with React and Vite; the backend uses
Java and Spring Boot; PostgreSQL stores application data; and Spring
Security with JWT protects the REST API.

## Features

-   Dashboard overview for customers, food items, orders, and revenue.
-   Customer management: list, create, view, update, and role-protected
    delete.
-   Food item management: list, create, view, update, and role-protected
    delete.
-   Order management: create orders, list orders, find orders by
    customer, update order status, and role-protected delete.
-   JWT-based login and registration.
-   BCrypt password hashing.
-   Role-based authorization enforced by Spring Security.
-   Swagger UI / OpenAPI documentation.

## Technology Stack

  Layer               Technologies
  ------------------- -------------------------------------
  Frontend            React, Vite, JavaScript
  Styling             Tailwind CSS, custom CSS
  Backend             Java, Spring Boot
  REST API            Spring Web MVC
  Persistence         Spring Data JPA, Hibernate
  Database            PostgreSQL
  Security            Spring Security, JWT (JJWT), BCrypt
  API documentation   SpringDoc OpenAPI / Swagger UI
  Build tools         Maven, npm

## Architecture

``` text
Browser
  |
  v
React + Vite frontend
  | HTTP requests with Authorization: Bearer <JWT>
  v
Spring Boot REST API
  |
  +--> Spring Security / JWT filter
  +--> Controllers
  +--> Services (business logic)
  +--> Spring Data JPA repositories
  |
  v
PostgreSQL
```

## Project Structure

``` text
food-order-management/
├── src/main/java/com/foodorder/
│   ├── config/       # Security, CORS, password and OpenAPI configuration
│   ├── controller/  # REST controllers
│   ├── dto/         # Request and response DTOs
│   ├── entity/      # JPA entities
│   ├── exception/   # Custom exceptions and global error handling
│   ├── repository/  # Spring Data JPA repositories
│   ├── security/    # JWT filter and user details service
│   └── service/     # Service interfaces and implementations
├── src/main/resources/
│   └── application.properties
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── pom.xml
└── README.md
```

## Prerequisites

Install: - JDK 21 - Maven - Node.js and npm - PostgreSQL (the project
has been tested with PostgreSQL 17) - Git - pgAdmin 4 (optional, for
database administration)

## Setup and Run Locally

### 1. Clone the repository

``` bash
git clone https://github.com/nitesh7254/food-order-management-system.git
cd food-order-management-system/food-order-management
```

If the repository structure changes, use the directory containing
`pom.xml`.

### 2. Create the database

Create a PostgreSQL database named `food_order_management` using pgAdmin
or SQL:

``` sql
CREATE DATABASE food_order_management;
```

### 3. Configure the backend

Edit `src/main/resources/application.properties`. Example local
configuration:

``` properties
spring.application.name=food-order-management
spring.datasource.url=jdbc:postgresql://localhost:5432/food_order_management
spring.datasource.username=${DB_USERNAME:****}
spring.datasource.password=${DB_PASSWORD:****}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

The username and password shown are development defaults, not universal
PostgreSQL credentials. Change them to match your local PostgreSQL
setup. Never commit real passwords or JWT signing secrets to GitHub. If
your existing configuration already works, keep its working values.

### 4. Configure the frontend API URL

Create `frontend/.env.local`:

``` env
VITE_API_BASE_URL=http://localhost:8080
```

Do not put passwords or private secrets in `VITE_` variables; frontend
variables are included in the browser bundle.

### 5. Install frontend packages

In a terminal:

``` bash
cd frontend
npm install
```

### 6. Start the backend

In a terminal from the directory containing `pom.xml`:

``` bash
mvn spring-boot:run
```

Backend URLs: - API base: `http://localhost:8080` - Swagger UI:
`http://localhost:8080/swagger-ui/index.html` - OpenAPI JSON:
`http://localhost:8080/v3/api-docs`

A successful startup should show Tomcat on port `8080` and a JDBC URL
pointing to `localhost:5432/food_order_management`.

### 7. Start the frontend

In a second terminal:

``` bash
cd frontend
npm run dev
```

Open: - Frontend: `http://localhost:5173` - Login:
`http://localhost:5173/login` - Dashboard:
`http://localhost:5173/dashboard`

Both frontend and backend must be running for the complete local
application to work.

## Authentication and Authorization

-   Login and registration are provided through `/api/auth/login` and
    `/api/auth/register`.
-   After login, the frontend sends the JWT in the
    `Authorization: Bearer <JWT>` header for protected requests.
-   The backend JWT filter validates the token and establishes the
    authenticated user.
-   Passwords are hashed using BCrypt.
-   The current backend security configuration restricts these delete
    operations to the `ADMIN` role:
    -   `DELETE /api/customers/{id}`
    -   `DELETE /api/food-items/{id}`
    -   `DELETE /api/orders/{id}`

Frontend route guards and hidden buttons are for user experience only.
The backend must enforce permissions. An admin account may be
initialized by the application; check the initializer and local database
for its configured email and role. Do not assume a default password.

## API Endpoints

Use Swagger UI to inspect the exact request/response schemas.

### Authentication

  Method   Endpoint               Purpose
  -------- ---------------------- ---------------------------
  POST     `/api/auth/register`   Register a user
  POST     `/api/auth/login`      Log in and obtain a token

### Customers

  Method   Endpoint                Purpose
  -------- ----------------------- ---------------------------
  GET      `/api/customers`        List customers
  GET      `/api/customers/{id}`   Get one customer
  POST     `/api/customers`        Create a customer
  PUT      `/api/customers/{id}`   Update a customer
  DELETE   `/api/customers/{id}`   Delete a customer (ADMIN)

### Food Items

  Method   Endpoint                 Purpose
  -------- ------------------------ ----------------------------
  GET      `/api/food-items`        List food items
  GET      `/api/food-items/{id}`   Get one food item
  POST     `/api/food-items`        Create a food item
  PUT      `/api/food-items/{id}`   Update a food item
  DELETE   `/api/food-items/{id}`   Delete a food item (ADMIN)

### Orders

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  GET                     `/api/orders`                         List orders

  GET                     `/api/orders/{id}`                    Get one order

  GET                     `/api/orders/customer/{customerId}`   List orders for a
                                                                customer

  POST                    `/api/orders`                         Create an order

  PUT                     `/api/orders/{id}/status`             Update order status

  DELETE                  `/api/orders/{id}`                    Delete an order (ADMIN)
  -------------------------------------------------------------------------------------

## Database

Main tables include: - `customers` --- customer records. - `food_items`
--- menu items. - `orders` --- order-level details. - `order_items` ---
items within an order. - `users` --- application accounts and roles.

Some database copies may also contain a `customer` table. Verify entity
mappings and data before removing any table.

### Inspect data in pgAdmin

1.  Open pgAdmin 4 and connect to your local PostgreSQL server.
2.  Expand **Databases → food_order_management → Schemas → public →
    Tables**.
3.  Right-click a table and choose **View/Edit Data**, or open Query
    Tool.

Example queries:

``` sql
SELECT * FROM customers ORDER BY id;
SELECT * FROM food_items ORDER BY id;
SELECT * FROM orders ORDER BY id;
SELECT * FROM users ORDER BY id;
```

## Local Development and Vercel

The local frontend can reach the backend at `http://localhost:8080` when
both run on your laptop. A Vercel-hosted frontend cannot use that
address to reach your laptop; in a visitor's browser, `localhost` means
that visitor's own device.

For Vercel to call the API, set `VITE_API_BASE_URL` to a publicly
reachable backend URL and configure backend CORS to allow the Vercel
origin. A secure tunnel can be used temporarily, but your laptop and
backend must remain running, and the tunnel URL may change. Do not
expose PostgreSQL port `5432` publicly.

## Troubleshooting

### "Failed to fetch"

-   Confirm Spring Boot is running on port `8080`.
-   Confirm `VITE_API_BASE_URL` is correct.
-   Restart Vite after changing `.env.local`.
-   Check backend CORS settings if the browser reports a CORS error.
-   On Vercel, `localhost` refers to the visitor's device, not your
    laptop.

### HTTP 401 or 403

-   Log in and confirm the JWT is present.
-   Check that requests include `Authorization: Bearer <JWT>`.
-   Check the user's role. Delete endpoints require `ADMIN`.

### Backend cannot connect to PostgreSQL

-   Confirm PostgreSQL is running.
-   Verify database name, port, username, and password.
-   Confirm `food_order_management` exists.
-   Read the first database-related exception in the backend terminal.

### Port already in use

Stop the process using port `8080` or `5173`, or configure another port
and update the API URL.

## Future Improvements

-   Add unit and integration tests.
-   Add pagination and search for larger datasets.
-   Expand API validation and documentation.
-   Configure deployment secrets through the hosting provider.
-   Consider HttpOnly secure cookies and an appropriate CSRF strategy if
    changing JWT storage from localStorage.

## Author

**Nitesh Kumar**

-   GitHub: [nitesh7254](https://github.com/nitesh7254)
-   Repository: [Food Order Management
    System](https://github.com/nitesh7254/food-order-management-system)
