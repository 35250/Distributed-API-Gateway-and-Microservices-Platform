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
                 |      Port: 3002      |
                 |                      |
                 |  Redis Rate Limiter  |
                 +----------+-----------+
                            |
                            | Authorized Request
                            v
                 +----------------------+
                 |   Task Service       |
                 |      Port: 3000      |
                 |                      |
                 |  Task CRUD Logic     |
                 +----------+-----------+
                            |
                            | Session Validation
                            v
                 +----------------------+
                 |   Auth Service       |
                 |      Port: 3001      |
                 |                      |
                 | User + Session Mgmt  |
                 +----------+-----------+
                            |
                            v
                    +---------------+
                    |  PostgreSQL    |
                    +---------------+
.

##🚪 API Gateway

The API Gateway acts as the public entry point to the system.

Instead of exposing the internal task service directly to clients, requests are first sent to the gateway.

The gateway is responsible for:

Receiving client requests
Applying Redis-based rate limiting
Forwarding valid requests to the Task Service
Forwarding the Authorization header to downstream services
Returning downstream responses to the client
Preventing excessive traffic from reaching the internal services

The gateway uses Redis to maintain request counters for client IP addresses.

Rate Limiting

The gateway implements a fixed-window rate limiter using Redis.

For every client IP, Redis maintains a key similar to:

rate_limit:<client-ip>

The request counter is incremented for every request.

The key expires automatically after the configured time window.

Requests exceeding the configured limit are rejected by the gateway with:

429 Too Many Requests

This prevents unnecessary traffic from reaching the Task and Auth services.

##🔐 Authentication Service

The Auth Service manages users and authentication sessions.

It is independently deployed from the Task Service.

Responsibilities
User registration
User login
Session creation
Session validation
Session deletion / logout
Session expiration
Authentication Flow

When a user logs in successfully, the Auth Service generates a unique session ID.

The client then sends the session ID through the HTTP Authorization header:

Authorization: <session-id>

The session is stored in PostgreSQL with an expiration timestamp.

When another service needs to verify the user, it communicates with the Auth Service through the /validate endpoint.

##📋 Task Service

The Task Service is responsible for task management.

It provides the following endpoints:

POST /tasks

Creates a new task.

The request contains:

{
  "title": "Example task",
  "description": "Example description"
}

The session ID is supplied through the Authorization header.

Before creating the task, the Task Service communicates with the Auth Service to verify the session.

GET /tasks/:id

Retrieves a task using its ID.

Example:

GET /tasks/1

The request requires a valid session through the Authorization header.

DELETE /tasks/:id

Deletes a task using its ID.

Example:

DELETE /tasks/1

The request also requires authentication.

##🗄️ PostgreSQL

PostgreSQL is used as the persistent database layer of the platform.

The database stores both application data and authentication data.

The deployed system uses PostgreSQL as the shared persistent storage layer for the services.

Task Data

The Task Service stores:

Task ID
Title
Description
Creation timestamp
Authentication Data

The Auth Service stores:

Users
User ID
Username
Password
Creation timestamp
Sessions
Session ID
User ID
Creation timestamp
Expiration timestamp

Sessions are associated with users through a foreign-key relationship.

##⚡ Redis

Redis is used by the API Gateway for rate limiting.

Unlike PostgreSQL, no predefined database schema or tables are required for the application's Redis usage.

The rate-limiting logic dynamically creates Redis keys when requests arrive.

For example:

rate_limit:192.168.1.10

The gateway increments the counter associated with the key and assigns an expiration time to it.

Once the expiration period ends, Redis automatically removes the key.

Therefore, the application does not require a separate Redis initialization script for tables or schema creation.

##🔄 Request Flow

A typical authenticated task request follows this flow:

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

This architecture ensures that excessive traffic can be rejected at the gateway before it consumes resources in the downstream services.

🧩 Services
Service	Responsibility
API Gateway	Public entry point, request forwarding and rate limiting
Task Service	Task creation, retrieval and deletion
Auth Service	Users, login, sessions and authentication
PostgreSQL	Persistent application and authentication data
Redis	Gateway rate-limiting state
🛠️ Technologies Used
Node.js
Express.js
PostgreSQL
Redis
JavaScript
REST APIs
HTTP
Apache Bench for load testing during development
Render for cloud deployment

##🔑 Authorization Architecture

The platform uses HTTP authorization headers for session propagation.

Example:

Authorization: <session-id>

The session ID is passed from the client to the Gateway and then forwarded to the Task Service.

The Task Service communicates with the Auth Service to validate the session before performing protected operations.

This keeps authentication logic centralized inside the Auth Service while allowing the Task Service to remain independently deployable.

☁️ Deployment

The services are designed as independently deployable applications.

The deployed architecture consists of:

Client
   |
   v
Render - API Gateway
   |
   +----> Render - Task Service
   |
   +----> Render - Auth Service
              |
              v
        Render PostgreSQL


API Gateway
   |
   v
Render Redis

Environment-specific configuration such as service URLs, database credentials, and Redis connection information is stored through environment variables rather than being hard-coded into the application.

##🔒 Environment Configuration

Sensitive configuration is kept outside the source code.

Typical configuration includes:

DATABASE_HOST
DATABASE_PORT
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD
REDIS_URL
AUTH_SERVICE_URL
TASK_SERVICE_URL

Actual credentials should never be committed to the repository.

For local development, these values can be supplied through .env files.

For deployment, the corresponding environment variables are configured in the cloud platform.

##🎯 Purpose of the Project

This project was built as a hands-on implementation of distributed backend architecture.

The primary goals were to understand how individual backend components interact when they are separated into independently deployable services.

The project focuses on concepts including:

Microservices
API Gateway architecture
Service-to-service HTTP communication
Authentication and session management
Authorization headers
PostgreSQL persistence
Redis-based rate limiting
Environment-based configuration
Cloud deployment
Separation of responsibilities between services

Rather than implementing everything inside one Node.js application, the system separates responsibilities across multiple services and makes them communicate over HTTP.

##👨‍💻 Author

Built by Ayan Dey

LinkedIn:
https://www.linkedin.com/in/ayandey212105242

##📌 Project Status

The core distributed architecture is implemented and deployed, including:

API Gateway
Redis rate limiting
Authentication Service
Task Service
PostgreSQL persistence
Inter-service authentication
Authorization through HTTP headers
Cloud deployment
                 API Gateway
                      |
                      v
                    Redis
             (Rate Limiting)



