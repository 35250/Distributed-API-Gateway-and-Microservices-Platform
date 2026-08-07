const express= require("express");
const pool= require("./db.js");
const crypto= require("crypto");
const app= express();
app.use(express.json);

app.post("/signup", async (req, res) => {
    try{
    const {username, password}= req.body;

    if(typeof username !== "string" || typeof password !== "string" || username.trim().length === 0 || password.trim().length === 0){
        return res.status(400).send("PLease send a valid username and password.");
    }

    const result= await pool.query(
        `
        SELECT * 
        FROM users
        WHERE username = $1;
        `,
    [username]
    );

    if(result.rows.length !== 0){
        return res.status(409).send("This username already exists. Please send a unique username.");
    }

    const insertResult= await pool.query(
        `
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id, username;
        `,
    [username, password]
    );

    return res.status(201).json({
        success: "User created successfully.",
        user: insertResult.rows
    });
    } catch (err) {
        console.error("POST /signup endpoint failed", err)
        return res.status(500).json({
            error: "Something went wrong. Please try again later!"
        });
    }
});

app.post("/login", async (req, res) => {
    try{
        const {username, password} = req.body;

        if(typeof username !== "string" || typeof password !== "string" || username.trim().length === 0 || password.trim().length === 0){
            return res.status(400).send("Please send a valid username and password.");
        }

        const result = await pool.query(
            `
            SELECT * 
            FROM users
            WHERE username = $1
            `,
            [username]
        )

        if(result.rows.length === 0){
            return res.status(401).send("Username not found!");
        }

        if(result.rows[0].password !== password){
            return res.status(401).send("Password didn't match!");
        }

        const sessionId= crypto.randomUUID();
        const userId= result.rows[0].id;

        await pool.query(
            `
            INSERT INTO sessions (session_id, user_id, expires_at)
            VALUES($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour');
            `,
            [sessionId, userId]
        )

        return res.status(200).json({
            success: "User has been logged in.",
            session: sessionId
        });

    } catch(err) {
        console.error("POST /login endpoint failed", err)
        return res.status(500).json({
            error: "Something went wrong. Please try again later!"
        });
    }
});

app.delete("/logout", async (req, res) => {
    try{
        const {sessionId} = req.body;

        if(typeof sessionId !== "string" || sessionId.trim().length === 0){
            return res.status(400).send("Invalid session");
        }

        const result= await pool.query(
            `
            DELETE FROM sessions
            WHERE session_id = $1
            RETURNING *;
            `,
            [sessionId]
        )

        if(result.rows.length === 0){
            return res.status(401).send("Wrong session");
        }

        return res.status(200).send("Session deleted successfully");
    
    } catch (err){
        console.error("DELETE /logout endpoint failed", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again later!"
        });
    }
});


app.listen(3000, () => {
    console.log(`Auth server is running on port 3000`);
})
