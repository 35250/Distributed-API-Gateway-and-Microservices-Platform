const express= require("express");
const pool= require("./db");
const authenticate= require("./authenticate");
const app= express();
app.use(express.json());

app.post("/tasks", async (req, res) => {
    try{
        const {title, description} = req.body;
        const sessionId = req.headers.authorization;
        const authResult = await authenticate(sessionId);
        
        if(!authResult.valid){
            return res.status(401).send(authResult.message);
        }

        if (title === undefined) {
            return res.status(400).send("Title is required");
        }

        if (typeof title !== "string") {
            return res.status(400).send("Title must be a string");
        }

        if (title.trim().length === 0) {
            return res.status(400).send("Title cannot be empty");
        }

        if (title.length > 100) {
            return res.status(400).send("Title must be within 100 characters");
        }

        if (description !== undefined) {

            if (typeof description !== "string") {
                return res.status(400).send("Description must be a string");
            }

            if (description.length > 1000) {
                return res.status(400).send("Description must be within 1000 characters");
            }
        }

        const result= await pool.query(
        `
        INSERT INTO tasks (title, description)
        VALUES ($1, $2)
        RETURNING id, title, description, created_at; 
        `,
        [title, description]
        );

        res.status(201).json(result.rows[0]);

    } catch(err) {
        console.error("POST /tasks endpoint failed:", err);
        res.status(500).json({
        error: "Something went wrong. Please try again later!"
        });
    }
});

app.get("/tasks/:id", async (req, res) =>{
    try{
        const id= Number(req.params.id);
        const sessionId = req.headers.authorization;

        const authResult = await authenticate(sessionId);

        if(!authResult.valid){
            return res.status(401).send(authResult.message);
        }

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).send("Please send a valid Task ID");
        }

        const result= await pool.query(
            `
            SELECT *
            FROM tasks
            WHERE id = $1
            `,
            [id]
        );

        if(result.rows.length === 0){
            return res.status(404).send("Task not found");
        }

        return res.status(200).json(result.rows[0]);

    } catch(err) {
        console.error("GET /tasks/:id endpoint failed:", err);
        res.status(500).json({
        error: "Something went wrong. Please try again later!" 
        });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try{
        const id= Number(req.params.id);
        const sessionId = req.headers.authorization;

        const authResult = await authenticate(sessionId);

        if(!authResult.valid){
            return res.status(401).send(authResult.message);
        }

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).send("Please send a valid Task ID");
        }

        const result= await pool.query(
            `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if(result.rows.length === 0){
            return res.status(404).send("Task not found");
        }

        return res.status(200).send("Task deleted");
    
    } catch(err) {
        console.error("DELETE /tasks/:id failed:", err);
        res.status(500).json({
        error: "Something went wrong. Please try again later!"    
        });
    }
});

app.listen(3000, () => {
    console.log(`Task server is running on 3000`);
});