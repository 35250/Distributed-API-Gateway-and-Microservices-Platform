# Distributed-API-Gateway-and-Microservices-Platform

  Client
                   │
                   ▼
             API Gateway
            (Node + Express)
             │          │
             │          ▼
             │       Redis
             │   (Rate Limiter)
             │
      ┌──────┴──────────┐
      ▼                 ▼
Auth Service      Business Service
      │
      ▼
 PostgreSQL
