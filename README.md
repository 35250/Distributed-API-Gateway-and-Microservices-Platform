# Distributed-API-Gateway-and-Microservices-Platform

  Browser (Client) -
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
