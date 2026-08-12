# Task service
POST /tasks - Status: 201 Created Size: 109 Bytes Time: 161 ms 
GET /tasks/:id - Status: 200 OK Size: 87 Bytes Time: 159 ms
DELETE /tasks/:id - Status: 200 OK Size: 12 Bytes Time: 158 ms
400 Bad request and 404 Not found is tested successfully. 

## ApacheBench Benchmark Results (Baseline 1 - Task Service)

| Requests | Concurrency | Throughput (req/s) ↑ | Median Latency (ms) ↓ | 99th Percentile (ms) ↓ | Max Latency (ms) | Failed Requests |
|---------:|------------:|---------------------:|----------------------:|-----------------------:|-----------------:|----------------:|
| 100      | 10          | 83.89                | 3                     | 1030                   | 1030             | 0               |
| 1000     | 50          | 736.94               | 41                    | 174                    | 1186             | 0               |
| 5000     | 100         | 1382.68              | 66                    | **86**                 | 1341             | 0               |
| 10000    | 200         | **1531.76**          | 123                   | 154                    | 1393             | 0               |
| 10000    | 500         | 1384.64              | 331                   | 1330                   | 1437             | 0               |
| 10000    | 1000        | 1397.22              | 648                   | 1770                   | 2739             | 0               |

## Key Observations

- Successfully handled all benchmark runs with **0 failed requests**.
- Throughput increased almost linearly up to **200 concurrent requests**, reaching a peak of **1531.76 requests/sec**.
- Beyond **200 concurrent requests**, throughput plateaued while latency increased significantly, indicating the saturation point of a single Task Service instance.
- The **5000 requests / 100 concurrent users** benchmark offered the best balance between throughput and latency:
  - Throughput: **1382.68 requests/sec**
  - Median Latency: **66 ms**
  - 99th Percentile Latency: **86 ms**
- These results serve as the **performance baseline** before introducing the API Gateway, Authentication Service, Redis Rate Limiting, and Load Balancer.


# Auth Service
POST /signup - Status: 201 Created Size: 77 Bytes Time: 162 ms
POST /login - Status: 200 OK Size: 87 Bytes Time: 166 ms
DELETE /logout - Status: 200 OK Size: 28 Bytes Time: 165 ms
POST /validate - Status: 200 OK Size: 53 Bytes Time: 167 ms
400 Bad request and 401 Not authorized is tested successfully. 

## ApacheBench Benchmark Results (Baseline 2 - Task Service along with Auth Service)

| Requests | Concurrency | Throughput (req/s) ↑ | Median Latency (ms) ↓ | 99th Percentile (ms) ↓ | Max Latency (ms) ↓ | Failed Requests |
|----------|-------------|----------------------|-----------------------|-------------------------|---------------------|-----------------|
| 100      | 10          | 61.44                | 9                     | 1018                    | 1018                | 0               |
| 1000     | 50          | 404.90               | 77                    | 1221                    | 2150                | 0               |
| 5000     | 100         | 691.05               | **130**                   | 239                     | 2307                | 0               |
| 10000    | 200         | **831.49**            | 237                   | **452**                 | 2392                | 0               |
| 10000    | 500         | **853.18**            | 574                   | 1221                    | 2539                | 0               |
| 10000    | 1000        | 821.85               | 1162                  | 3215                    | 3321                | 0               |

## Key Observations

- Successfully completed all six benchmark runs with **0 failed requests**.
- Throughput increased steadily as concurrency increased, reaching a peak of **853.18 requests/sec** at **500 concurrent requests**.
- The **5,000 requests / 100 concurrent users** benchmark provided the best overall balance between throughput and latency:
  - Throughput: **691.05 requests/sec**
  - Median Latency: **130 ms**
  - 99th Percentile Latency: **239 ms**
  - Max Latency: **2307 ms**
  - Failed Requests: **0**
- Increasing concurrency from **200 → 500** produced only a small throughput improvement (**831.49 → 853.18 req/s**) while median latency increased substantially (**237 → 574 ms**).
- At **1000 concurrent requests**, throughput decreased to **821.85 req/s** while median latency increased sharply to **1162 ms** and the 99th percentile reached **3215 ms**.
- This indicates that the Task Service approaches its saturation region around **200–500 concurrent requests**, where additional concurrency provides diminishing throughput gains but significantly increases latency.

## ApacheBench Benchmark Results (Baseline 3 - Gateway Redis rate limiter + Task + Auth)

Rate limit: 100 requests/IP per 60 seconds  
Endpoint: GET /tasks/1  
Gateway: 172.27.144.1:3002  
Architecture: Gateway → Task Service → Auth Service → PostgreSQL

| Total Requests | Concurrency | Accepted (2xx) | Rejected (429) | Requests/sec | Mean Latency | P99 Latency |
|----------------|-------------|----------------|----------------|--------------|--------------|-------------|
| 100            | 10          | 100            | 0              | 36.43        | 274.51 ms    | 2074 ms     |
| 1,000          | 50          | 100            | 900            | 406.85       | 122.89 ms    | 1214 ms     |
| 5,000          | 100         | 100            | 4,900          | 1709.20      | 58.51 ms     | 388 ms      |
| 10,000         | 200         | 100            | 9,900          | 1905.36      | 104.97 ms    | 213 ms      |
| 10,000         | 500         | 100            | 9,900          | 2146.92      | 232.89 ms    | 1168 ms     |
| 10,000         | 1,000       | 100            | 9,900          | 2246.39      | 445.16 ms    | 3179 ms     |

### Key Observation

- The Redis-backed Gateway consistently enforced the **100 requests/IP/60s** rate limit under increasing load.
- In the **5,000 requests / 100 concurrent** test:
  - **4,900 requests were intentionally rejected with HTTP 429 by the Gateway**
  - **100 requests were allowed to reach the downstream Task → Auth services**,
- This reducing unnecessary downstream processing and demonstrating the Gateway's role as the system's first-line traffic control layer.
