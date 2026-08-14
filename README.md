# Distributed API Gateway and Microservices Platform

A distributed backend system built with Node.js and Express that demonstrates how multiple independently deployable services can work together through an API Gateway, authentication service, PostgreSQL, and Redis.

The project was built to understand and implement real-world backend concepts such as **microservice architecture, service-to-service communication, authentication, API gateway design, rate limiting, database management, and cloud deployment**.

## 🌐 Live Application

The system is exposed through the API Gateway:

**Live URL:**
https://gateway-service-2w0d.onrender.com

Opening the gateway URL displays an overview of the services provided by the platform.

---

## 🏗️ Architecture

The platform consists of three independently deployable Node.js services:

```text
                         Client
                           |
                           | HTTP Request
                           v
                 +----------------------+
                 |     API Gateway      |
                 |                      |
                 |  Redis Rate Limiter  |
                 +----------+-----------+
                            |
                            | Authorized Request
                            v
                 +----------------------+
                 |    Task Service      |
                 |                      |
                 |   Task Management    |
                 +----------+-----------+
                            |
                            | Session Validation
                            v
                 +----------------------+
                 |    Auth Service      |
                 |                      |
                 | User + Session Mgmt  |
                 +----------+-----------+
                            |
                            v
                    +---------------+
                    |  PostgreSQL    |
                    +---------------+

                 API Gateway
                      |
                      v
                    Redis
             (Rate Limiting)
```

Each service has a separate responsibility and can be deployed independently.

---

## 🚪 API Gateway

The API Gateway acts as the public entry point to the system.

Instead of exposing the internal Task Service directly to clients, requests are first sent to the Gateway.

The Gateway is responsible for:

* Receiving client requests
* Applying Redis-based rate limiting
* Forwarding valid requests to the Task Service
* Forwarding the `Authorization` header to downstream services
* Returning downstream responses to the client
* Preventing excessive traffic from reaching the internal services

### Redis Rate Limiting

The Gateway implements a fixed-window rate limiter using Redis.

For every client IP, Redis maintains a temporary key similar to:

```text
rate_limit:<client-ip>
```

The request counter is incremented for every request.

The key automatically expires after the configured time window.

Requests exceeding the configured limit are rejected by the Gateway with:

```text
429 Too Many Requests
```

This allows excessive traffic to be stopped at the Gateway before it reaches the downstream services.

---

## 🔐 Authentication Service

The Auth Service manages users and authentication sessions.

It is independently deployed from the Task Service.

### Responsibilities

* User registration
* User login
* Session creation
* Session validation
* Session deletion / logout
* Session expiration

### Authentication Flow

When a user logs in successfully, the Auth Service generates a unique session ID.

The client sends the session ID through the HTTP `Authorization` header:

```http
Authorization: <session-id>
```

The session is stored in PostgreSQL together with its expiration timestamp.

When another service needs to verify the user, it communicates with the Auth Service through the `/validate` endpoint.

---

## 📋 Task Service

The Task Service is responsible for task management.

The deployed application provides the following protected endpoints.

### `POST /tasks`

Creates a new task.

Example request body:

```json
{
  "title": "Example task",
  "description": "Example description"
}
```

The session ID is supplied through the `Authorization` header.

Before creating the task, the Task Service communicates with the Auth Service to verify the session.

### `GET /tasks/:id`

Retrieves a task using its ID.

Example:

```text
GET /tasks/1
```

The request requires a valid session through the `Authorization` header.

### `DELETE /tasks/:id`

Deletes a task using its ID.

Example:

```text
DELETE /tasks/1
```

The request also requires authentication.

---

## 🗄️ PostgreSQL

PostgreSQL provides persistent storage for the platform.

The database stores both application data and authentication data.

### Task Data

The Task Service stores:

* Task ID
* Title
* Description
* Creation timestamp

### Authentication Data

The Auth Service stores two related tables.

#### Users

* User ID
* Username
* Password
* Creation timestamp

#### Sessions

* Session ID
* User ID
* Creation timestamp
* Expiration timestamp

Sessions are associated with users through a foreign-key relationship.

---

## ⚡ Redis

Redis is used by the API Gateway for rate limiting.

Unlike PostgreSQL, the application's Redis usage does not require predefined tables or a database schema.

The rate-limiting logic dynamically creates Redis keys when requests arrive.

For example:

```text
rate_limit:192.168.1.10
```

The Gateway increments the counter associated with the key and assigns an expiration time.

Once the expiration period ends, Redis automatically removes the key.

Therefore, there is no separate table or schema initialization required for the application's Redis rate-limiting data.

---

## 🔄 Request Flow

A typical authenticated task request follows this flow:

```text
Client
  |
  | Authorization: <session-id>
  v
API Gateway
  |
  | Redis Rate Limit Check
  |
  +----> Request allowed
  |
  v
Task Service
  |
  | Authorization: <session-id>
  v
Auth Service
  |
  | Validate session
  v
PostgreSQL
  |
  | Session information
  v
Auth Service
  |
  | Authentication result
  v
Task Service
  |
  | Execute task operation
  v
PostgreSQL
  |
  v
Task Service
  |
  v
API Gateway
  |
  v
Client
```

This architecture allows excessive traffic to be rejected at the Gateway before it consumes resources in the downstream services.

---

## 🧩 Services

| Service          | Responsibility                                           |
| ---------------- | -------------------------------------------------------- |
| **API Gateway**  | Public entry point, request forwarding and rate limiting |
| **Task Service** | Task creation, retrieval and deletion                    |
| **Auth Service** | Users, login, sessions and authentication                |
| **PostgreSQL**   | Persistent application and authentication data           |
| **Redis**        | Gateway rate-limiting state                              |

---

## 🛠️ Technologies Used

* Node.js
* Express.js
* PostgreSQL
* Redis
* JavaScript
* REST APIs
* HTTP
* Render
* Apache Bench for development testing

---

## 🔑 Authorization Architecture

The platform uses HTTP authorization headers for session propagation.

Example:

```http
Authorization: <session-id>
```

The session ID is passed from the client to the API Gateway and then forwarded to the Task Service.

The Task Service communicates with the Auth Service to validate the session before performing protected operations.

This keeps authentication logic centralized inside the Auth Service while allowing the Task Service to remain independently deployable.

---

## ☁️ Deployment

The platform is designed as a collection of independently deployable services.

The deployed architecture consists of:

```text
Client
   |
   v
API Gateway
   |
   +----> Task Service
   |
   +----> Auth Service
              |
              v
         PostgreSQL

API Gateway
   |
   v
Redis
```

Environment-specific configuration such as service URLs, database credentials, and Redis connection information is stored through environment variables rather than being hard-coded into the application.

---

## 🔒 Environment Configuration

Sensitive configuration is kept outside the source code.

Typical configuration includes:

```text
DATABASE_HOST
DATABASE_PORT
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD
REDIS_URL
AUTH_SERVICE_URL
TASK_SERVICE_URL
```

Actual credentials should never be committed to the repository.

For local development, these values can be supplied through `.env` files.

For deployment, the corresponding environment variables are configured through the cloud platform.

---

## 🎯 Purpose of the Project

This project was built as a hands-on implementation of distributed backend architecture.

The primary goal was to understand how individual backend components interact when they are separated into independently deployable services.

The project focuses on:

* Microservice architecture
* API Gateway architecture
* Service-to-service HTTP communication
* Authentication and session management
* Authorization headers
* PostgreSQL persistence
* Redis-based rate limiting
* Environment-based configuration
* Cloud deployment
* Separation of responsibilities between services

Rather than implementing everything inside one Node.js application, the system separates responsibilities across multiple services and makes them communicate over HTTP.

---

## 👨‍💻 Author

**Ayan Dey**

LinkedIn:
https://www.linkedin.com/in/ayandey212105242

---

## 📌 Project Status

The core distributed architecture is implemented and deployed, including:

* API Gateway
* Redis rate limiting
* Authentication Service
* Task Service
* PostgreSQL persistence
* Inter-service authentication
* Authorization through HTTP headers
* Cloud deployment




