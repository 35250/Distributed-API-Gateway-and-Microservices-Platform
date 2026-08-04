const express= require("express");
const pool= require("./db.js");
const app= express();

app.get("/check", async (req, res) => {
    await pool.query(
        res.send("Database is connected")
    );
    
    return res.status(200).send("Auth server is created");
})

app.listen(3000, () => {
    console.log(`Auth server is running on port 3000`);
})
