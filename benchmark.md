# Task service
POST /tasks - Status: 201 Created Size: 109 Bytes Time: 161 ms 
GET /tasks/:id - Status: 200 OK Size: 87 Bytes Time: 159 ms
DELETE /tasks/:id - Status: 200 OK Size: 12 Bytes Time: 158 ms
400 Bad request and 404 Not found is tested successfully. 

## ApacheBench Benchmark Results (Baseline - Task Service)

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
