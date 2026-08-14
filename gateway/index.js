const express = require("express");
const {connectRedis, rateLimit} = require("./rate_limit");
const app = express();
app.use(express.json());

async function startServer() {
    try {
        await connectRedis();

        app.listen(3002, () => {
            console.log("Gateway server is running on 3002");
        });

    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
}

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Distributed API Gateway and Microservices Platform</title>
        </head>

        <body>
            <h1>Distributed API Gateway and Microservices Platform</h1>

            <h2>Services Offered</h2>
            <ul>
                <li>Redis Rate Limiter</li>
                <li>User Authentication</li>
            </ul>

            <h2>Endpoints Deployed</h2>
            <ul>
                <li>POST /tasks</li>
                <li>GET /tasks/:id</li>
                <li>DELETE /tasks/:id</li>
            </ul>
        </body>
        </html>
    `);
});

app.post("/tasks", async (req, res) => {
    try {
        const rateLimitResult= await rateLimit(req.ip);

        if(!rateLimitResult.withinLimit){
            return res.status(429).send("Too many requests. Please try again later!");
        }
        
        const {title, description} = req.body;
        const sessionId = req.headers.authorization;

        const response = await fetch(`${process.env.TASK_SERVICE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": sessionId 
            },
            
            body: JSON.stringify({
                title,
                description
            })
        });

        const data = await response.json();
        return res.status(response.status).send(data);
    
    } catch (err){
        console.error("POST /tasks endpoint failed!", err);
        res.status(500).json({
            error: "Something went wrong. Please try again later!" 
        });
    }    
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const rateLimitResult= await rateLimit(req.ip);

        if(!rateLimitResult.withinLimit){
            return res.status(429).send("Too many requests. Please try again later!");
        }
        
        const id = Number(req.params.id);
        const sessionId = req.headers.authorization;

        const response = await fetch(`${process.env.TASK_SERVICE_URL}/tasks/${id}`, {
            method: "GET",
            headers: {
                "Authorization": sessionId 
            }
            
        });
        
        const data = await response.json();
        return res.status(response.status).send(data);
    
    } catch (err){
        console.error("GET /tasks endpoint failed!", err);
        res.status(500).json({
            error: "Something went wrong. Please try again later!" 
        });
    }    
}); 

app.delete("/tasks/:id", async (req, res) => {
    try {
        const rateLimitResult= await rateLimit(req.ip);

        if(!rateLimitResult.withinLimit){
            return res.status(429).send("Too many requests. Please try again later!");
        }

        const id = Number(req.params.id);
        const sessionId = req.headers.authorization;

        const response = await fetch(`${process.env.TASK_SERVICE_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": sessionId
            }
        });
        
        const data = await response.json();
        return res.status(response.status).send(data);

    } catch(err) {
        console.error("DELETE /tasks/:id endpoint failed", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again later!"
        }); 
    }    
});

startServer();
