require("dotenv").config(); 
const {Pool}= require("pg");
const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_NAME,
    DB_PASSWORD
} = process.env;

const pool = new Pool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASSWORD
});

module.exports = pool;