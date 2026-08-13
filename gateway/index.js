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

app.post("/tasks", async (req, res) => {
    try {
        const rateLimitResult= await rateLimit(req.ip);

        if(!rateLimitResult.withinLimit){
            return res.status(429).send("Too many requests. Please try again later!");
        }
        
        const {title, description} = req.body;
        const sessionId = req.headers.authorization;

        const response = await fetch("http://localhost:3000/tasks", {
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

        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
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

        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
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
